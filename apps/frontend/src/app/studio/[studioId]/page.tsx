'use client';

import { useEffect, useState, useRef } from 'react';
import { ChatBox } from '../../../components/studio/ChatBox';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../../stores/authStore';
import { useUserMedia } from '../../../hooks/useUserMedia';
import { VideoPlayer } from  '../../../components/studio/VideoPlayer';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/api';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Participant {
  id: string;
  userId: string;
}

interface RemotePeer {
  socketId: string;
  stream: MediaStream;
}

export default function StudioPage() {
  const params = useParams();
  const studioId = params.studioId as string;
  const { user } = useAuthStore();
  const { stream: localStream, isMuted, isVideoOff, toggleMute, toggleVideo } = useUserMedia();

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const activeRecordingIdRef = useRef<string | null>(null);

  // --- EFFECT 1: JOIN STUDIO VIA HTTP ---
  // This effect runs when the user's auth state is known. Its only job is to
  // create the official "Participant" record in the database.
  useEffect(() => {
    if (user && studioId) {
      console.log('Attempting to join studio via API...');
      api.post(`/studio/${studioId}/join`)
        .then(response => {
          console.log('Successfully joined studio:', response.data);
          setParticipant(response.data);
        })
        .catch(error => console.error('Failed to join studio via API', error));
    }
  }, [studioId, user]);

  // --- EFFECT 2: INITIALIZE WEBSOCKETS & WEBRTC ---
  // This effect runs only after we have the local media stream and have successfully
  // joined the studio (i.e., we have a participant ID).
  useEffect(() => {
    if (localStream && participant) {
      console.log('Initializing WebSockets and WebRTC...');
      const socket = io('http://localhost:3005');
      socketRef.current = socket;

      // =================================================================
      // WEB RTC EXPLANATION: The Handshake
      // WebRTC allows browsers to stream video directly to each other (peer-to-peer).
      // To start, they need a central server (our WebSocket Gateway) to act as a
      // "matchmaker" to exchange connection info. This is called SIGNALING.
      // 1. User A sends an "offer" to talk.
      // 2. User B receives it and sends back an "answer".
      // 3. They exchange network details ("ICE candidates") to find the best path.
      // 4. They connect directly.
      // =================================================================

      const createPeerConnection = (peerSocketId: string): RTCPeerConnection => {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        
        pc.ontrack = (event) => {
          setRemotePeers((prev) => [...prev.filter(p => p.socketId !== peerSocketId), { socketId: peerSocketId, stream: event.streams[0] }]);
        };
        
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
        
        pc.onicecandidate = (event) => {
          if (event.candidate) socket.emit('webrtc-ice-candidate', { to: peerSocketId, candidate: event.candidate });
        };
        
        peerConnectionsRef.current.set(peerSocketId, pc);
        return pc;
      };

      socket.on('connect', () => socket.emit('join-studio', { studioId }));

      socket.on('user-joined', async ({ userId }) => {
        const pc = createPeerConnection(userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { to: userId, offer });
      });

      socket.on('webrtc-offer', async ({ from, offer }) => {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { to: from, answer });
      });

      socket.on('webrtc-answer', async ({ from, answer }) => {
        const pc = peerConnectionsRef.current.get(from);
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('webrtc-ice-candidate', ({ from, candidate }) => {
        const pc = peerConnectionsRef.current.get(from);
        if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on('user-left', ({ userId }) => {
        peerConnectionsRef.current.get(userId)?.close();
        peerConnectionsRef.current.delete(userId);
        setRemotePeers((prev) => prev.filter(p => p.socketId !== userId));
      });

      return () => {
        socket.disconnect();
        peerConnectionsRef.current.forEach(pc => pc.close());
      };
    }
  }, [localStream, participant, studioId]);

  const handleStartRecording = async () => {
    if (!localStream || !participant) return;
    setIsRecording(true);
    recordedChunksRef.current = [];
    try {
      const response = await api.post('/recording/start', {
        studioId: studioId,
        participantId: participant.id,
        fileType: 'video',
      });
      activeRecordingIdRef.current = response.data.id;

      mediaRecorderRef.current = new MediaRecorder(localStream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const fileName = `${studioId}-${participant.id}-${Date.now()}.webm`;
        try {
          const { data } = await api.post('/storage/presigned-url', { fileName });
          await fetch(data.uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': 'video/webm' } });
          const fileUrl = data.uploadUrl.split('?')[0];
          await api.post('/recording/stop', { recordingId: activeRecordingIdRef.current, filePath: fileUrl, fileSize: blob.size });
          alert('Recording uploaded successfully!');
        } catch (error) {
          console.error('Failed to upload recording', error);
          alert('Upload failed.');
        }
      };
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Failed to start recording on the server', error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Invite link copied to clipboard!');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <main className="flex-1 flex flex-col p-4">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Studio Session</h1>
          <Button onClick={copyInviteLink} variant="secondary">
            <Copy className="mr-2 h-4 w-4" /> Copy Invite Link
          </Button>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <VideoPlayer
              stream={localStream}
              isLocalPlayer={true}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
            />
            <div className="absolute bottom-2 left-2 bg-black/50 p-1 rounded-md text-sm">
              {user?.name || 'You'}
            </div>
          </div>

          {remotePeers.map((peer) => (
            <div key={peer.socketId} className="relative">
              <VideoPlayer stream={peer.stream} />
              <div className="absolute bottom-2 left-2 bg-black/50 p-1 rounded-md text-sm">
                Participant {peer.socketId.substring(0, 5)}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-4 h-20 bg-gray-800 rounded-lg flex items-center justify-center gap-4">
          <Button onClick={toggleMute} variant={isMuted ? 'destructive' : 'secondary'} size="lg">
            {isMuted ? <MicOff /> : <Mic />}
            <span className="ml-2">{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>
          <Button onClick={toggleVideo} variant={isVideoOff ? 'destructive' : 'secondary'} size="lg">
            {isVideoOff ? <VideoOff /> : <Video />}
            <span className="ml-2">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
          </Button>

          {!isRecording ? (
            <Button onClick={handleStartRecording} disabled={!localStream || !participant} size="lg" className="bg-green-600 hover:bg-green-700">
              Start Recording
            </Button>
          ) : (
            <Button onClick={handleStopRecording} variant="destructive" size="lg">
              Stop Recording
            </Button>
          )}

           <Button variant="destructive" size="lg">
            <PhoneOff />
            <span className="ml-2">Leave</span>
          </Button>
        </footer>
      </main>

      <aside className='w-8 bg-gray-950 p-4 border-l border-gray-700'>
        <ChatBox socket={socketRef.current} studioId={studioId}/>
      </aside>
    </div>
  );
}