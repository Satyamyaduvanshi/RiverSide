import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})

export class StudioGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`client disconnect: ${client.id}`)
    client.rooms.forEach((room)=>{
      if(room != client.id){
        client.to(room).emit('user-left',{ userId: client.id })
      }
    })
  }

  @SubscribeMessage('join-studio')
  handleJoinStudio(client:Socket,payload:{ studioId:string}): void {
    const {studioId} = payload;
    client.join(studioId)

    client.to(studioId).emit('user-joined',{userId:client.id});

    console.log(`Client ${client.id} joined ${studioId}`);

  }

  @SubscribeMessage('webrtc-offer')
  handleOffer(client: Socket, payload: { to: string; offer: any }): void {
    client.to(payload.to).emit('webrtc-offer', {
      from: client.id,
      offer: payload.offer,
    });
  }

  // Add this handler for WebRTC answers
  @SubscribeMessage('webrtc-answer')
  handleAnswer(client: Socket, payload: { to: string; answer: any }): void {
    client.to(payload.to).emit('webrtc-answer', {
      from: client.id,
      answer: payload.answer,
    });
  }

  // Add this handler for WebRTC ICE candidates
  @SubscribeMessage('webrtc-ice-candidate')
  handleIceCandidate(client: Socket, payload: { to: string; candidate: any }): void {
    client.to(payload.to).emit('webrtc-ice-candidate', {
      from: client.id,
      candidate: payload.candidate,
    });
  }
}

