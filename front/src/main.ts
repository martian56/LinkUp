import './style.css';

// WebRTC Configuration with Google STUN servers
const configuration: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ]
    }
  ]
};

// State
let ws: WebSocket | null = null;
let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let clientId: string = '';
let remoteClientId: string = '';
let isAudioMuted: boolean = false;
let isVideoMuted: boolean = false;

// DOM Elements
const roomInput = document.getElementById('roomInput') as HTMLInputElement;
const joinBtn = document.getElementById('joinBtn') as HTMLButtonElement;
const leaveBtn = document.getElementById('leaveBtn') as HTMLButtonElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
const muteBtn = document.getElementById('muteBtn') as HTMLButtonElement;
const videoBtn = document.getElementById('videoBtn') as HTMLButtonElement;
const clientIdDisplay = document.getElementById('clientIdDisplay') as HTMLSpanElement;
const roomDisplay = document.getElementById('roomDisplay') as HTMLSpanElement;
const connectionState = document.getElementById('connectionState') as HTMLSpanElement;
const remoteVideoPlaceholder = document.getElementById('remoteVideoPlaceholder') as HTMLDivElement;

// Generate a unique client ID
function generateClientId(): string {
  return `client-${Math.random().toString(36).substr(2, 9)}`;
}

// Update status
function updateStatus(message: string, type: 'normal' | 'connected' | 'error' = 'normal') {
  statusText.textContent = message;
  statusText.parentElement?.classList.remove('connected', 'error');
  if (type !== 'normal') {
    statusText.parentElement?.classList.add(type);
  }
}

// Initialize local media stream
async function initLocalStream() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: true
    });
    
    localVideo.srcObject = localStream;
    muteBtn.disabled = false;
    videoBtn.disabled = false;
    
    console.log('Local stream initialized');
    return true;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    updateStatus('Error: Could not access camera/microphone', 'error');
    alert('Please allow camera and microphone access to use video calling.');
    return false;
  }
}

// Setup WebSocket connection
function connectWebSocket(room: string) {
  clientId = generateClientId();
  
  // Backend configuration
  // For local development: localhost:8081
  // For deployed backend: 35.179.191.97:8081
  const backendHost = '35.179.191.97';
  const backendPort = '8081';
  const wsUrl = `ws://${backendHost}:${backendPort}/ws/${clientId}`;
  
  console.log('Connecting to backend:', wsUrl);
  updateStatus('Connecting to signaling server...');
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    updateStatus('Connected to signaling server', 'connected');
    
    // Join the room
    ws?.send(JSON.stringify({
      type: 'join',
      room: room
    }));
    
    clientIdDisplay.textContent = clientId;
    roomDisplay.textContent = room;
  };
  
  ws.onmessage = async (event) => {
    const message = JSON.parse(event.data);
    console.log('Received message:', message.type, message);
    
    switch (message.type) {
      case 'room-joined':
        updateStatus(`Joined room: ${message.room}`, 'connected');
        console.log('Existing users in room:', message.users);
        // If there are existing users, initiate connection with the first one
        if (message.users && message.users.length > 0) {
          remoteClientId = message.users[0];
          console.log('Creating offer to existing user:', remoteClientId);
          await createOffer(remoteClientId);
        } else {
          console.log('No existing users in room, waiting for others to join');
        }
        break;
        
      case 'user-joined':
        console.log('User joined:', message.clientId);
        remoteClientId = message.clientId;
        updateStatus(`User ${message.clientId} joined`, 'connected');
        // Don't create offer here - the new user will create the offer to us
        console.log('Waiting for offer from new user:', remoteClientId);
        break;
        
      case 'offer':
        remoteClientId = message.from;
        await handleOffer(message.offer, message.from);
        break;
        
      case 'answer':
        await handleAnswer(message.answer);
        break;
        
      case 'ice-candidate':
        await handleIceCandidate(message.candidate);
        break;
        
      case 'user-left':
        console.log('User left:', message.clientId);
        updateStatus('Remote user disconnected', 'error');
        closePeerConnection();
        break;
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    console.error('Failed to connect to:', wsUrl);
    updateStatus('Connection error - check console', 'error');
  };
  
  ws.onclose = (event) => {
    console.log('WebSocket closed. Code:', event.code, 'Reason:', event.reason);
    console.log('Was clean close:', event.wasClean);
    updateStatus('Disconnected from server', 'error');
  };
}

// Create peer connection
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);
  
  // Add local stream tracks
  if (localStream) {
    localStream.getTracks().forEach(track => {
      peerConnection?.addTrack(track, localStream!);
    });
  }
  
  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && ws && remoteClientId) {
      ws.send(JSON.stringify({
        type: 'ice-candidate',
        candidate: event.candidate,
        target: remoteClientId
      }));
      console.log('Sent ICE candidate');
    }
  };
  
  // Handle remote stream
  peerConnection.ontrack = (event) => {
    console.log('Received remote track');
    if (remoteVideo.srcObject !== event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
      remoteVideoPlaceholder.classList.add('hidden');
      updateStatus('Connected to remote user', 'connected');
    }
  };
  
  // Handle connection state changes
  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection?.connectionState;
    console.log('Connection state:', state);
    connectionState.textContent = state || 'unknown';
    
    if (state === 'connected') {
      updateStatus('Call connected', 'connected');
    } else if (state === 'disconnected' || state === 'failed') {
      updateStatus('Call disconnected', 'error');
      closePeerConnection();
    }
  };
  
  // Handle ICE connection state changes
  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE connection state:', peerConnection?.iceConnectionState);
  };
  
  return peerConnection;
}

// Create and send offer
async function createOffer(targetId: string) {
  console.log('Creating offer for:', targetId);
  
  const pc = createPeerConnection();
  
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    ws?.send(JSON.stringify({
      type: 'offer',
      offer: offer,
      target: targetId
    }));
    
    console.log('Sent offer');
  } catch (error) {
    console.error('Error creating offer:', error);
  }
}

// Handle incoming offer
async function handleOffer(offer: RTCSessionDescriptionInit, from: string) {
  console.log('Handling offer from:', from);
  
  const pc = createPeerConnection();
  
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    ws?.send(JSON.stringify({
      type: 'answer',
      answer: answer,
      target: from
    }));
    
    console.log('Sent answer');
  } catch (error) {
    console.error('Error handling offer:', error);
  }
}

// Handle incoming answer
async function handleAnswer(answer: RTCSessionDescriptionInit) {
  console.log('Handling answer');
  
  try {
    await peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
    console.log('Remote description set');
  } catch (error) {
    console.error('Error handling answer:', error);
  }
}

// Handle incoming ICE candidate
async function handleIceCandidate(candidate: RTCIceCandidateInit) {
  console.log('Handling ICE candidate');
  
  try {
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('ICE candidate added');
    }
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
  }
}

// Close peer connection
function closePeerConnection() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  remoteVideo.srcObject = null;
  remoteVideoPlaceholder.classList.remove('hidden');
  connectionState.textContent = 'closed';
  remoteClientId = '';
}

// Toggle audio
function toggleAudio() {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      isAudioMuted = !audioTrack.enabled;
      
      muteBtn.classList.toggle('active', isAudioMuted);
      const span = muteBtn.querySelector('span');
      if (span) {
        span.textContent = isAudioMuted ? 'Unmute' : 'Mute';
      }
    }
  }
}

// Toggle video
function toggleVideo() {
  if (localStream) {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      isVideoMuted = !videoTrack.enabled;
      
      videoBtn.classList.toggle('active', isVideoMuted);
      const span = videoBtn.querySelector('span');
      if (span) {
        span.textContent = isVideoMuted ? 'Start Video' : 'Stop Video';
      }
    }
  }
}

// Join room
async function joinRoom() {
  const room = roomInput.value.trim();
  
  console.log('Join room clicked. Room:', room);
  
  if (!room) {
    alert('Please enter a room name');
    return;
  }
  
  updateStatus('Requesting camera access...', 'normal');
  
  // Initialize local stream first
  console.log('Requesting camera/microphone access...');
  const success = await initLocalStream();
  if (!success) {
    console.error('Failed to get camera/microphone access');
    return;
  }
  
  console.log('Camera/microphone access granted');
  
  // Connect to signaling server
  console.log('Connecting to signaling server...');
  connectWebSocket(room);
  
  // Update UI
  joinBtn.disabled = true;
  leaveBtn.disabled = false;
  roomInput.disabled = true;
}

// Leave room
function leaveRoom() {
  // Send leave message
  if (ws) {
    ws.send(JSON.stringify({ type: 'leave' }));
    ws.close();
    ws = null;
  }
  
  // Close peer connection
  closePeerConnection();
  
  // Stop local stream
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  localVideo.srcObject = null;
  
  // Reset UI
  joinBtn.disabled = false;
  leaveBtn.disabled = true;
  roomInput.disabled = false;
  muteBtn.disabled = true;
  videoBtn.disabled = true;
  
  clientId = '';
  remoteClientId = '';
  
  clientIdDisplay.textContent = '-';
  roomDisplay.textContent = '-';
  connectionState.textContent = '-';
  
  updateStatus('Not connected');
}

// Event listeners
joinBtn.addEventListener('click', joinRoom);
leaveBtn.addEventListener('click', leaveRoom);
muteBtn.addEventListener('click', toggleAudio);
videoBtn.addEventListener('click', toggleVideo);

// Allow Enter key to join
roomInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !joinBtn.disabled) {
    joinRoom();
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (ws) {
    ws.send(JSON.stringify({ type: 'leave' }));
  }
});

console.log('Video Call App initialized');
