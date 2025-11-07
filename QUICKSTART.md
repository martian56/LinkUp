# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Backend Dependencies

```bash
cd back
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies

```bash
cd front
npm install
```

### Step 3: Start the Application

**Option A: Use the provided batch script (Windows)**
```bash
# From the project root directory
start-all.bat
```
This will start both backend and frontend in separate windows automatically!

**Option B: Manual start (any OS)**

Terminal 1 - Backend:
```bash
cd back
python main.py
```

Terminal 2 - Frontend:
```bash
cd front
npm run dev
```

## 🎥 Start Your First Video Call

1. Open your browser and go to `http://localhost:5173`
   - **On your phone?** Use `http://YOUR_IP:5173` (get your IP with `ipconfig` on Windows)
   - Note: Most mobile browsers allow camera access on local network IPs (192.168.x.x)
2. Enter a room name (e.g., "test-room")
3. Click "Join Room" and allow camera/microphone access
4. Open another browser tab or use another device
5. Enter the same room name
6. You're now connected! 🎉

## 📱 Testing on Different Devices

- **Same computer**: Open two browser tabs
- **Phone/Tablet**: 
  1. Make sure your phone is on the same WiFi network
  2. Find your computer's IP address:
     - Windows: `ipconfig` (look for IPv4 Address, e.g., 192.168.1.100)
     - macOS/Linux: `ifconfig` or `ip addr`
  3. On your phone, go to `http://YOUR_IP:5173`
  4. Allow camera/microphone access when prompted
     - Note: Most mobile browsers allow camera access on private network IPs
- **Remote testing**: For public internet access, you'll need HTTPS (use ngrok or deploy with SSL)

**Note:** The app works over HTTP for local network testing because browsers treat private IPs (192.168.x.x, 10.x.x.x) as secure contexts for camera/microphone access.

## 🔧 Troubleshooting

- **Camera not working?** Check browser permissions
- **Can't connect?** Make sure both backend (port 8000) and frontend (port 5173) are running
- **No remote video?** Wait a few seconds for the connection to establish

## 📚 More Info

See [README.md](README.md) for detailed documentation.

