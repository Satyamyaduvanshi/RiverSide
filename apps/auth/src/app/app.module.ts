import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
//import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal:true,
    expandVariables:true
  }),
  JwtModule.register({
    secret: "jwt-operation",
    signOptions:{
      expiresIn: "1h"
    }
  })
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
