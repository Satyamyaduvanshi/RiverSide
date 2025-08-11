'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../../stores/authStore';

// Note: In a real app, the socket connection should be managed more globally.
let socket: Socket;

export default function StudioPage() {
  const params = useParams();
  const studioId = params.studioId as string;
  const { user } = useAuthStore();
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    // Connect to the WebSocket Gateway
    socket = io('http://localhost:3005'); // The port your WebSocket gateway is running on

    socket.on('connect', () => {
      console.log('Connected to WebSocket gateway!');
      // Emit an event to join the specific studio room
      socket.emit('join-studio', { studioId });
    });

    // Listen for other users joining
    socket.on('user-joined', (data: { userId: string }) => {
      console.log('A new user joined:', data.userId);
      setParticipants((prev) => [...prev, data.userId]);
    });

    // Listen for users leaving
    socket.on('user-left', (data: { userId: string }) => {
      console.log('A user left:', data.userId);
      setParticipants((prev) => prev.filter((id) => id !== data.userId));
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [studioId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Studio Session: {studioId}</h1>
      <p className="text-muted-foreground">Welcome, {user?.name || 'Guest'}!</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Participants</h2>
        <ul className="list-disc pl-5">
          {/* Add yourself to the list initially */}
          {socket && <li>{socket.id} (You)</li>}
          {participants.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}