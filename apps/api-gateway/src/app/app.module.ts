import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [ClientsModule.register([{
    name:"fdasfasd",
    transport:Transport.TCP,
    options:{
      host:"localhost",
      port:4000
    }
  }])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
