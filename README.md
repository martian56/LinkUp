# Video Call App

A simple peer-to-peer video calling application with vanilla TypeScript frontend and FastAPI WebSocket signaling server.

## Features

- 📹 Real-time video and audio communication
- 🌐 WebRTC with Google STUN servers
- 🔄 WebSocket signaling for peer connection setup
- 🎨 Modern, responsive UI
- 🎤 Audio mute/unmute controls
- 📹 Video on/off controls
- 🚪 Room-based calling system

## Tech Stack

### Frontend
- **Vanilla TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **WebRTC** - Peer-to-peer video/audio communication
- **Google STUN servers** - NAT traversal

### Backend
- **FastAPI** - Modern Python web framework
- **WebSocket** - Real-time bidirectional communication
- **Uvicorn** - ASGI server

## Project Structure

```
video_call/
├── front/              # Frontend application
│   ├── src/
│   │   ├── main.ts    # Main TypeScript logic
│   │   └── style.css  # Styling
│   ├── index.html     # HTML template
│   ├── package.json   # Node dependencies
│   └── tsconfig.json  # TypeScript config
│
├── back/               # Backend signaling server
│   ├── main.py        # FastAPI WebSocket server
│   └── requirements.txt
│
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd back
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the signaling server:
   ```bash
   python main.py
   ```

   The server will start on `http://localhost:8000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd front
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   The app will be available at:
   - Local: `http://localhost:5173`
   - Network: `http://YOUR_IP:5173` (accessible from other devices on your network)
   
   The server runs on `0.0.0.0` so you can access it from your phone or other devices.
   
   **Note:** Most mobile browsers allow camera/microphone access on private network IPs (192.168.x.x, 10.x.x.x) even over HTTP.

## Usage

1. **Start both servers** (backend and frontend)

2. **Open the app** in your browser at `http://localhost:5173`

3. **Enter a room name** (e.g., "room123")

4. **Click "Join Room"** - You'll be prompted to allow camera and microphone access

5. **Share the same room name** with another person on a different device/browser

6. **The call will automatically connect** when both users are in the same room

### Tips

- Use the same room name on different devices to connect
- Test locally by opening two browser tabs with the same room name
- **Mobile access**: Find your computer's IP address and use `http://YOUR_IP:5173` on your phone
  - Windows: Run `ipconfig` and look for IPv4 Address
  - macOS/Linux: Run `ifconfig` or `ip addr` and look for inet address
  - Mobile browsers allow camera access on private network IPs even over HTTP
- Use the mute and video toggle buttons to control your media
- Check "Connection Info" to see connection status

## How It Works

### Signaling Flow

1. Client connects to WebSocket server with unique ID
2. Client joins a room by sending room name
3. Server notifies other users in the room
4. Clients exchange WebRTC offers, answers, and ICE candidates through the server
5. Direct peer-to-peer connection is established
6. Video/audio streams flow directly between peers

### WebRTC Connection

- Uses Google's STUN servers for NAT traversal
- Establishes direct peer-to-peer connections when possible
- Falls back gracefully if direct connection isn't possible

## API Endpoints

### REST API

- `GET /` - Server status and statistics

### WebSocket

- `ws://localhost:8000/ws/{client_id}` - WebSocket connection endpoint

### Message Types

**Client → Server:**
- `join` - Join a room
- `offer` - Send WebRTC offer
- `answer` - Send WebRTC answer
- `ice-candidate` - Send ICE candidate
- `leave` - Leave room

**Server → Client:**
- `room-joined` - Confirmation of joining room
- `user-joined` - Another user joined
- `user-left` - User left the room
- `offer` - WebRTC offer from peer
- `answer` - WebRTC answer from peer
- `ice-candidate` - ICE candidate from peer

## Building for Production

### Frontend

```bash
cd front
npm run build
```

The built files will be in the `front/dist` directory.

### Backend

For production deployment:

```bash
cd back
# Note: Use only 1 worker for WebSocket with in-memory state
# For horizontal scaling, implement shared state with Redis
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Camera/Microphone Access

- Ensure your browser has permission to access camera and microphone
- HTTPS is required for getUserMedia on non-localhost domains
- Check browser console for specific error messages

### Connection Issues

- Verify both frontend and backend servers are running
- Check that WebSocket connection is successful (look in browser console)
- Ensure firewall isn't blocking connections
- Try using Chrome/Firefox for best WebRTC compatibility

### No Video/Audio

- Check that both users have allowed media permissions
- Verify the connection state shows "connected"
- Look for ICE connection state in the console
- Some networks may block peer-to-peer connections (corporate networks, strict NATs)

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (may have limitations)
- Opera

## Deployment

The app is configured to automatically connect to:
- **Local backend**: `localhost:8080` (when accessing from localhost or 192.168.x.x)
- **Deployed backend**: `35.179.191.97:8081` (when accessing from the internet)

To use your own deployed backend, update the `backendHost` and `backendPort` in `front/src/main.ts`.

## Security Notes

- This is a demo application for development/learning
- For production use:
  - Add authentication
  - Use HTTPS/WSS
  - Implement TURN servers for better connectivity
  - Add rate limiting
  - Validate and sanitize all inputs

## License

MIT License - Feel free to use this for learning and development!

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

