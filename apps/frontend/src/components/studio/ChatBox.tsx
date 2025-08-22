import { Socket } from "socket.io-client"
import { useAuthStore } from "../../stores/authStore"
import React, { useState,useEffect } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"


interface chatMessage {
    message:string
    sender: string
    socketId: string
}

interface chatboxProps{
    socket: Socket | null
    studioId: string
}

export function ChatBox({socket,studioId}:chatboxProps){
    const {user} = useAuthStore()
    const [message, setMessage] = useState("")
    const [chatHistory,setChatHistory] = useState<chatMessage[]>([]);

 useEffect(() => {
    if (!socket) return;

 
    const handleNewMessage = (newMessage: chatMessage) => {
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
      // Add message to our own chat history immediately
      setChatHistory((prev) => [...prev, newMessage]);
      // Send the message to the server to be broadcast to others
      socket.emit('send-chat-message', { studioId, ...newMessage });
      setMessage('');
    }
  };


    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg p-4">
            <h1 className=" text-lg font-semibold mb-4">
                Live Chat
            </h1>

            <div className="flex-1 overflow-y-auto mb-4">
                {chatHistory.map((chat,index)=>(
                    <div className={`mb-2 ${chat.socketId === socket?.id ? 'text-right' : ''}`} key={index} >

                        <span className={`text-xs font-bold ${chat.socketId === socket?.id ? 'text-blue-400' : 'text-green-400'}`}>
                            {chat.socketId === socket?.id ? 'You' : chat.sender}
                        </span>

                        <p className={`p-2 rounded-lg inline-block ${chat.socketId === socket?.id ? 'bg-blue-600':'bg-gray-700'}`}>
                            {chat.message}
                        </p>
                    </div>
                ))}

            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2" >
               <Input
               value={message}
               onChange={(e)=> setMessage(e.target.value)}
               placeholder="Type a message..."
               className="bg-gray-900 border-gray-700"

               />
               
               <Button type="submit">Send</Button>

            </form>

        </div>
    )
}