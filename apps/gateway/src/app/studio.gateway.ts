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
}

