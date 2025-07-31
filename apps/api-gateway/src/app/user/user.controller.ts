import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { MICROSERVICE } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';
import { User } from './decorator/user.decorator';

@Controller('user')
export class UserController {

    constructor(@Inject(MICROSERVICE.user) private readonly userService:ClientProxy){}

    @UseGuards(AuthGuard)
    @Get('me')
    async getUserProfile(@User() user:{userId:string}){
        const userId = user.userId
        return this.userService.send("user-getProfile",userId)
    }
}
