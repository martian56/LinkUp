# Video Call Frontend

Vanilla TypeScript frontend for peer-to-peer video calling using WebRTC.

## Installation

```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at:
- Local: `http://localhost:5173`
- Network: `http://YOUR_IP:5173` (e.g., `http://192.168.1.100:5173`)

The server runs on `0.0.0.0`, making it accessible from other devices on your network (like your phone).

**Note:** Mobile browsers allow camera/microphone access on private network IPs even over HTTP.

## Building for Production

```bash
npm run build
```

Built files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Features

- WebRTC peer-to-peer video calling
- Google STUN servers for NAT traversal
- Real-time signaling via WebSocket
- Audio/video controls
- Modern, responsive UI
- Room-based calling system

## Usage

1. Enter a room name
2. Click "Join Room"
3. Allow camera and microphone access
4. Share the room name with another person
5. Start calling!

## Configuration

The WebSocket server URL is automatically configured based on your connection in `src/main.ts`. It uses your current hostname to connect to the backend.

### Accessing from Phone/Other Devices

To access from your phone or another device:

1. Find your computer's IP address:
   - Windows: Run `ipconfig` (look for IPv4 Address)
   - macOS/Linux: Run `ifconfig` or `ip addr`

2. Make sure both devices are on the same WiFi network

3. Access the app from your phone at `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

4. Allow camera and microphone access when prompted

**Why HTTP works:** Most mobile browsers treat private network IPs (192.168.x.x, 10.x.x.x) as secure contexts and allow camera/microphone access even over HTTP. For public internet access, you would need HTTPS.

