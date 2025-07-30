import { Body, Controller, Headers, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { MICROSERVICE } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../../guards/auth/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(@Inject(MICROSERVICE.auth) private  authServiceClient:ClientProxy){}

    @Post('signup')
    async createUser(@Body() body:CreateUserDto){
        return this.authServiceClient.send('auth-createUser',body)
    }

    @Post('login')
    async login(@Body() body:LoginUserDto){
        return this.authServiceClient.send("auth-loginUser",body)
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@Req() req){
        const userId = req.user.userId
        return this.authServiceClient.send("auth-logout",userId)
    }

    @Post('refresh')
    async refreshToken(@Body() body:{ refreshToken: string}){
        return this.authServiceClient.send("auth-refreshtoken",body.refreshToken)
    }
}
