import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {  AppService } from './app.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PrismaModule } from '../../../../packages/prisma/src';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
