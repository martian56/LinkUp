from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Set
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Video Call Signaling Server")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections: client_id -> WebSocket
connections: Dict[str, WebSocket] = {}

# Store rooms: room_id -> Set of client_ids
rooms: Dict[str, Set[str]] = {}


@app.get("/")
async def root():
    return {
        "message": "Video Call Signaling Server",
        "status": "running",
        "active_connections": len(connections),
        "active_rooms": len(rooms),
        "rooms": {room: list(users) for room, users in rooms.items()}
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    logger.info(f"WebSocket connection request from client {client_id}")
    await websocket.accept()
    connections[client_id] = websocket
    logger.info(f"Client {client_id} connected. Total connections: {len(connections)}")
    logger.info(f"Active clients: {list(connections.keys())}")
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            logger.info(f"Received from {client_id}: {message.get('type')}")
            
            message_type = message.get("type")
            
            if message_type == "join":
                # Client wants to join a room
                room_id = message.get("room")
                if room_id not in rooms:
                    rooms[room_id] = set()
                rooms[room_id].add(client_id)
                
                # Notify all other clients in the room
                for other_client_id in rooms[room_id]:
                    if other_client_id != client_id and other_client_id in connections:
                        await connections[other_client_id].send_json({
                            "type": "user-joined",
                            "clientId": client_id
                        })
                
                # Send back list of existing users
                existing_users = [uid for uid in rooms[room_id] if uid != client_id]
                await websocket.send_json({
                    "type": "room-joined",
                    "room": room_id,
                    "users": existing_users
                })
                
                logger.info(f"Client {client_id} joined room {room_id}")
            
            elif message_type == "offer":
                # Forward WebRTC offer to target client
                target_id = message.get("target")
                if target_id in connections:
                    await connections[target_id].send_json({
                        "type": "offer",
                        "offer": message.get("offer"),
                        "from": client_id
                    })
                    logger.info(f"Forwarded offer from {client_id} to {target_id}")
            
            elif message_type == "answer":
                # Forward WebRTC answer to target client
                target_id = message.get("target")
                if target_id in connections:
                    await connections[target_id].send_json({
                        "type": "answer",
                        "answer": message.get("answer"),
                        "from": client_id
                    })
                    logger.info(f"Forwarded answer from {client_id} to {target_id}")
            
            elif message_type == "ice-candidate":
                # Forward ICE candidate to target client
                target_id = message.get("target")
                if target_id in connections:
                    await connections[target_id].send_json({
                        "type": "ice-candidate",
                        "candidate": message.get("candidate"),
                        "from": client_id
                    })
                    logger.info(f"Forwarded ICE candidate from {client_id} to {target_id}")
            
            elif message_type == "leave":
                # Client is leaving
                await handle_disconnect(client_id)
    
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
        await handle_disconnect(client_id)
    except Exception as e:
        logger.error(f"Error for client {client_id}: {e}")
        await handle_disconnect(client_id)


async def handle_disconnect(client_id: str):
    # Remove from connections
    if client_id in connections:
        del connections[client_id]
    
    # Remove from rooms and notify others
    for room_id, users in rooms.items():
        if client_id in users:
            users.remove(client_id)
            # Notify other users in the room
            for other_client_id in users:
                if other_client_id in connections:
                    try:
                        await connections[other_client_id].send_json({
                            "type": "user-left",
                            "clientId": client_id
                        })
                    except:
                        pass
            
            # Clean up empty rooms
            if len(users) == 0:
                del rooms[room_id]
            break
    
    logger.info(f"Client {client_id} cleanup complete")


if __name__ == "__main__":
    import uvicorn
    # Note: Use only 1 worker for WebSocket with in-memory state
    uvicorn.run(app, host="0.0.0.0", port=8081, workers=1)

