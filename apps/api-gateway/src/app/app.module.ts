import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { MICROSERVICE } from '../constant';

@Module({
  imports: [ClientsModule.register([
    {
    name: MICROSERVICE.auth,
    transport: Transport.TCP,
    options:{
      host:"127.0.0.1",
      port:8877
    }
    }
])],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
