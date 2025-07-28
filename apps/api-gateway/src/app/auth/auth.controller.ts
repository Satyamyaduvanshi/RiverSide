import { Body, Controller, Inject, Post } from '@nestjs/common';
import { MICROSERVICE } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

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
}
