'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuthContext } from '../../components/auth/AuthProvider'; // <-- Correct import

interface ChatMessage {
  message: string;
  sender: string;
  socketId: string;
}

interface ChatBoxProps {
  socket: Socket | null;
  studioId: string;
}

export function ChatBox({ socket, studioId }: ChatBoxProps) {
  const user = useAuthContext((state) => state.user); // <-- Use the new hook
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: ChatMessage) => {
      setChatHistory((prev) => [...prev, newMessage]);
    };
    
    socket.on('new-chat-message', handleNewMessage);

    return () => {
      socket.off('new-chat-message', handleNewMessage);
    };
  }, [socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const newMessage = {
        message,
        sender: user?.name || 'Guest',
        socketId: socket.id,
      };
      setChatHistory((prev) => [...prev, newMessage]);
      socket.emit('send-chat-message', { studioId, ...newMessage });
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Live Chat</h2>
      <div className="flex-1 overflow-y-auto mb-4">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`mb-2 ${chat.socketId === socket?.id ? 'text-right' : ''}`}>
            <span className={`text-xs font-bold ${chat.socketId === socket?.id ? 'text-blue-400' : 'text-green-400'}`}>
              {chat.socketId === socket?.id ? 'You' : chat.sender}
            </span>
            <p className={`p-2 rounded-lg inline-block ${chat.socketId === socket?.id ? 'bg-blue-600' : 'bg-gray-700'}`}>
              {chat.message}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="bg-gray-900 border-gray-700"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}