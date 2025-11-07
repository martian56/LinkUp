# Video Call Signaling Server

FastAPI WebSocket signaling server for WebRTC video calling.

## Installation

1. Create virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate virtual environment:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Development mode:
```bash
python main.py
```

Production mode:
```bash
# Note: Use only 1 worker for WebSocket with in-memory state
# For production with multiple workers, use Redis or similar for shared state
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
```

The server will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## WebSocket Connection

Connect to: `ws://localhost:8000/ws/{client_id}`

Where `client_id` is a unique identifier for each client.

