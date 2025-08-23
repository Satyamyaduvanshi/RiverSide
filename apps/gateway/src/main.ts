import { NestFactory } from '@nestjs/core';
//import { AppModule } from './app.module';
import { AppModule } from './app/app.module';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Create a Redis client for the publisher
  const pubClient = createClient({ url: 'redis://localhost:6379' });
  // Create another for the subscriber
  const subClient = pubClient.duplicate();

  // Create the Socket.IO Redis adapter
  const redisAdapter = createAdapter(pubClient, subClient);

  // Connect the NestJS app to the adapter
  app.useWebSocketAdapter(new IoAdapter(app, redisAdapter as any));

  await Promise.all([pubClient.connect(), subClient.connect()]);
  
  await app.listen(3006);
  console.log('WebSocket gateway is running on port 3006 with Redis adapter');
}
bootstrap();