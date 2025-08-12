import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { MICROSERVICE } from '../constant';
import { UserController } from './user/user.controller';
import { StudioController } from './studio/studio.controller';
import { RecordingController } from './recording/recording.controller';
import { StorageController } from './storage/storage.controller';
//import { StorageModule } from './storage/storage.module';

@Module({
  imports: [ClientsModule.register([
    {
    name: MICROSERVICE.auth,
    transport: Transport.TCP,
    options:{
      host:"127.0.0.1",
      port:8877
    }
    },
    {
      name:MICROSERVICE.user,
      transport: Transport.TCP,
      options:{
      host:"127.0.0.1",
      port:3002
      }
    },
    {
      name:MICROSERVICE.studio,
      transport: Transport.TCP,
      options:{
        host:"127.0.0.1",
        port:3003
      },
    },
    {
      name: MICROSERVICE.recording, 
      transport: Transport.TCP,
      options: { 
        host: 'localhost',
        port: 3004 
      },
    },
    {
      name: MICROSERVICE.storage, 
      transport: Transport.TCP,
      options: { 
        host: 'localhost', 
        port: 3005 
      },
    },
]),
//StorageModule
],
  controllers: [AppController, AuthController, UserController, StudioController, RecordingController, StorageController],
  providers: [AppService],
})
export class AppModule {}
