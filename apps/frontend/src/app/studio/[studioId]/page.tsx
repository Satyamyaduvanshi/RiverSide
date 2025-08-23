'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuthContext } from '../../../components/auth/AuthProvider';
import { useUserMedia } from '../../../hooks/useUserMedia';
import { VideoPlayer } from '../../../components/studio/VideoPlayer';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/api';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy } from 'lucide-react';
import { ChatBox } from '../../../components/studio/ChatBox';

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
  const router = useRouter();
  const studioId = params.studioId as string;
  const user = useAuthContext((state) => state.user);
  const { stream: localStream, isMuted, isVideoOff, toggleMute, toggleVideo } = useUserMedia();

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const activeRecordingIdRef = useRef<string | null>(null);

  useEffect(() => {

    console.log("user inside studio page : ", user)
    if (user && studioId) {

      console.log("inside the user and studioId useeffect")
      api.post(`/studio/${studioId}/join`)
        .then(response => {
          setParticipant(response.data);
        })
        .catch(error => console.error('Failed to join studio via API', error));
    }
  }, [studioId, user]);

  useEffect(() => {
    if (localStream && participant) {

      console.log("starting socket")
      const newSocket = io('http://localhost:3005');
      setSocket(newSocket);

      const createPeerConnection = (peerSocketId: string): RTCPeerConnection => {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pc.ontrack = (event) => {
          setRemotePeers((prev) => [...prev.filter(p => p.socketId !== peerSocketId), { socketId: peerSocketId, stream: event.streams[0] }]);
        };
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
        pc.onicecandidate = (event) => {
          if (event.candidate) newSocket.emit('webrtc-ice-candidate', { to: peerSocketId, candidate: event.candidate });
        };
        peerConnectionsRef.current.set(peerSocketId, pc);
        return pc;
      };

      newSocket.on('connect', () => newSocket.emit('join-studio', { studioId }));
      newSocket.on('user-joined', async ({ userId }) => {
        const pc = createPeerConnection(userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        newSocket.emit('webrtc-offer', { to: userId, offer });
      });
      newSocket.on('webrtc-offer', async ({ from, offer }) => {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        newSocket.emit('webrtc-answer', { to: from, answer });
      });
      newSocket.on('webrtc-answer', async ({ from, answer }) => {
        const pc = peerConnectionsRef.current.get(from);
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });
      newSocket.on('webrtc-ice-candidate', ({ from, candidate }) => {
        const pc = peerConnectionsRef.current.get(from);
        if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
      });
      newSocket.on('user-left', ({ userId }) => {
        peerConnectionsRef.current.get(userId)?.close();
        peerConnectionsRef.current.delete(userId);
        setRemotePeers((prev) => prev.filter(p => p.socketId !== userId));
      });

      return () => {
        newSocket.disconnect();
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

  const handleLeave = () => {
    router.push('/dashboard');
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

           <Button onClick={handleLeave} variant="destructive" size="lg">
            <PhoneOff />
            <span className="ml-2">Leave</span>
          </Button>
        </footer>
      </main>

      <aside className='w-80 bg-gray-950 p-4 border-l border-gray-700'>
        {socket && <ChatBox socket={socket} studioId={studioId} />}
      </aside>
    </div>
  );
}