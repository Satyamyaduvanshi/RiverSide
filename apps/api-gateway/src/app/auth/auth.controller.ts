import { Body, Controller,Res, Inject, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { MICROSERVICE } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../../guards/auth/auth.guard';
import * as express from 'express'; 
import { firstValueFrom } from 'rxjs';
import { User } from './decorator/user.decorator';

@Controller('auth')
export class AuthController {

    constructor(@Inject(MICROSERVICE.auth) private  authServiceClient:ClientProxy){}

    @Post('signup')
    async createUser(@Body() body:CreateUserDto){
        return this.authServiceClient.send('auth-createUser',body)
    }

    @Post('login')
    async login(@Body() body:LoginUserDto,@Res({ passthrough: true }) res: express.Response){
        const token = await firstValueFrom( this.authServiceClient.send("auth-loginUser",body))

        res.cookie('refresh-token',token.refreshToken,{
            httpOnly:true,
            secure: process.env.NODE_ENV !== 'development',
            path: '/auth/refresh',
            expires: new Date(Date.now()+ 7 * 24 * 60 * 60 * 1000)
        })

        return {accessTokoen: token.accessToken}
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@User() user:{userId:string}) {
        const userId = user.userId; 
        return this.authServiceClient.send("auth-logout", userId);
    }

    @Post('refresh')
    async refreshToken(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response){
        const refreshToken = req.cookies['refresh-token']
        if(!refreshToken) throw new UnauthorizedException("refresh token not found!")

        const token = await firstValueFrom( this.authServiceClient.send("auth-refreshtoken",refreshToken))
        res.cookie('refresh-token',token.refreshToken,{
            httpOnly:true,
            secure: process.env.NODE_ENV !== 'development',
            path: '/auth/refresh',
            expires: new Date(Date.now()+ 7 * 24 * 60 * 60 * 1000)
        })
        return {accessTokoen: token.accessToken}
    }
}
