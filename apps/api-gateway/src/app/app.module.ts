import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { MICROSERVICE } from '../constant';
import { UserController } from './user/user.controller';

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
    }
])],
  controllers: [AppController, AuthController, UserController],
  providers: [AppService],
})
export class AppModule {}
