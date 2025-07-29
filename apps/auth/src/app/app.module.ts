import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import refreashConfig from './config/refresh.config';
//import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal:true,
    expandVariables:true
  }),
  JwtModule.registerAsync(jwtConfig.asProvider()),
  ConfigModule.forFeature(jwtConfig),
  ConfigModule.forFeature(refreashConfig)
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
