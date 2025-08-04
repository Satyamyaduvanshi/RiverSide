import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import s3Config from './config/s3.config';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    ConfigModule.forFeature(s3Config)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
