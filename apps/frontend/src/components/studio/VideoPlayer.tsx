'use client';

import { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isMuted?: boolean;
  isVideoOff?: boolean;
  toggleMute?: () => void;
  toggleVideo?: () => void;
  isLocalPlayer?: boolean;
}

export function VideoPlayer({
  stream,
  isMuted,
  isVideoOff,
  toggleMute,
  toggleVideo,
  isLocalPlayer = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-black rounded-md overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted={isLocalPlayer || isMuted} // Mute your own video and others if they are muted
        className="w-full h-auto"
      />
      {/* Show controls only for the local player */}
      {isLocalPlayer && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          <Button onClick={toggleMute} variant={isMuted ? 'destructive' : 'secondary'} size="icon">
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button onClick={toggleVideo} variant={isVideoOff ? 'destructive' : 'secondary'} size="icon">
            {isVideoOff ? <VideoOff /> : <Video />}
          </Button>
        </div>
      )}
    </div>
  );
}