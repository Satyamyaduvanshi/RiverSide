

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices"

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,{
    transport: Transport.TCP,
    options:{
      host:"127.0.0.1",
      port:3003
    }
  });

  await app.listen();
  Logger.log(
    `🚀 Studio service is running on: 3003 `
  );
}

bootstrap();
