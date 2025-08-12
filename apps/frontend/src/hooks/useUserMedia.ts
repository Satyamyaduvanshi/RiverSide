'use client';

import { useState, useEffect, useCallback } from 'react';

export function useUserMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const getUserMedia = async () => {
      let mediaStream: MediaStream | null = null;
      try {
        // First, try to get both video and audio
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (err) {
        console.error('Could not get both video and audio.', err);
        // If that fails, try to get only audio
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          setIsVideoOff(true); // Since we only got audio, video is "off"
        } catch (audioErr) {
          console.error('Could not get audio.', audioErr);
          // If that also fails, try to get only video
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            setIsMuted(true); // Since we only got video, audio is "muted"
          } catch (videoErr) {
            console.error('Could not get video.', videoErr);
            // If all attempts fail, error out
            console.error('Error accessing media devices.', videoErr);
            return;
          }
        }
      }
      setStream(mediaStream);
    };

    getUserMedia();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []); // Note: dependency array is empty to run only once

  const toggleMute = useCallback(() => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, [stream]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  }, [stream]);

  return { stream, isMuted, isVideoOff, toggleMute, toggleVideo };
}