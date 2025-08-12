'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../../stores/authStore';
import { useUserMedia } from '../../../hooks/useUserMedia';
import { VideoPlayer } from '../../../components/studio/VideoPlayer';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/api';

// Define a type for our Participant object for better type safety
interface Participant {
  id: string;
  userId: string;
  studioId: string;
  role: 'HOST' | 'GUEST';
}

export default function StudioPage() {
  const params = useParams();
  const studioId = params.studioId as string;
  const { user } = useAuthStore();
  const { stream: localStream, isMuted, isVideoOff, toggleMute, toggleVideo } = useUserMedia();
  
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const initializeStudio = async () => {
      if (user && studioId && localStream) {
        try {
          // Step 1: Join the studio via HTTP to create the participant record
          const response = await api.post(`/studio/${studioId}/join`);
          setParticipant(response.data);

          // Step 2: Connect to the WebSocket Gateway for real-time communication
          const socket = io('http://localhost:3005');
          socketRef.current = socket;

          // --- WebRTC Logic ---
          const createPeerConnection = (peerSocketId: string): RTCPeerConnection => {
            const pc = new RTCPeerConnection({
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            });
            pc.ontrack = (event) => {
              setRemoteStreams((prev) => new Map(prev).set(peerSocketId, event.streams[0]));
            };
            localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
            pc.onicecandidate = (event) => {
              if (event.candidate) {
                socket.emit('webrtc-ice-candidate', { to: peerSocketId, candidate: event.candidate });
              }
            };
            peerConnectionsRef.current.set(peerSocketId, pc);
            return pc;
          };

          // --- WebSocket Event Listeners ---
          socket.on('connect', () => {
            console.log('Connected to WebSocket gateway!');
            socket.emit('join-studio', { studioId });
          });

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
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
          });

          socket.on('webrtc-ice-candidate', ({ from, candidate }) => {
            const pc = peerConnectionsRef.current.get(from);
            if (pc) {
              pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
          });
          
          socket.on('user-left', ({ userId }) => {
            peerConnectionsRef.current.get(userId)?.close();
            peerConnectionsRef.current.delete(userId);
            setRemoteStreams((prev) => {
              const newMap = new Map(prev);
              newMap.delete(userId);
              return newMap;
            });
          });

        } catch (error) {
          console.error('Failed to initialize studio', error);
        }
      }
    };

    initializeStudio();

    return () => {
      socketRef.current?.disconnect();
      peerConnectionsRef.current.forEach((pc) => pc.close());
    };
  }, [studioId, user, localStream]);

  const handleStartRecording = async () => {
    if (!localStream || !participant) {
      alert('Media stream or participant data is not available.');
      return;
    }
    
    setIsRecording(true);
    recordedChunksRef.current = [];

    try {
      const response = await api.post('/recording/start', {
        studioId: studioId,
        participantId: participant.id,
        fileType: 'video',
      });
      setActiveRecordingId(response.data.id);

      mediaRecorderRef.current = new MediaRecorder(localStream);
    
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
  
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const fileName = `${studioId}-${participant.id}-${Date.now()}.webm`;
  
        try {
          const { data } = await api.post('/storage/presigned-url', { fileName });
          
          await fetch(data.uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': 'video/webm' },
          });
  
          const fileUrl = data.uploadUrl.split('?')[0];
  
          await api.post('/recording/stop', {
            recordingId: activeRecordingId,
            filePath: fileUrl,
            fileSize: blob.size,
          });
  
          alert('Recording uploaded successfully!');
        } catch (error) {
          console.error('Failed to upload recording', error);
          alert('Upload failed.');
        }
      };
      
      mediaRecorderRef.current.start();
      console.log('Recording started...');

    } catch (error) {
      console.error('Failed to start recording on the server', error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stopped. Preparing for upload...');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Studio Session</h1>
      <div className="flex items-center gap-4 my-4">
        {!isRecording ? (
          <Button onClick={handleStartRecording} disabled={!localStream || !participant}>
            Start Recording
          </Button>
        ) : (
          <Button onClick={handleStopRecording} variant="destructive">
            Stop Recording
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <div>
          <h2 className="font-semibold mb-2">{user?.name || 'You'}</h2>
          <VideoPlayer
            stream={localStream}
            isLocalPlayer={true}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            toggleMute={toggleMute}
            toggleVideo={toggleVideo}
          />
        </div>
        {Array.from(remoteStreams.entries()).map(([socketId, stream]) => (
          <div key={socketId}>
            <h2 className="font-semibold mb-2">Participant {socketId.substring(0, 5)}</h2>
            <VideoPlayer stream={stream} />
          </div>
        ))}
      </div>
    </div>
  );
}