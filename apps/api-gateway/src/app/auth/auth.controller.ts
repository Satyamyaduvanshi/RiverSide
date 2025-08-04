import { Body, Controller, Res, Inject, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { MICROSERVICE } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../../guards/auth/auth.guard';
import * as express from 'express';
import { firstValueFrom } from 'rxjs';
import { User } from '../../decorator/user.decorator';

@Controller('auth')
export class AuthController {

    constructor(@Inject(MICROSERVICE.auth) private readonly authServiceClient: ClientProxy) { }

    @Post('signup')
    async createUser(@Body() body: CreateUserDto) {
        const user = await firstValueFrom(this.authServiceClient.send('auth-createUser', body));
        return {
            message: "user created",
            name: user.name
        };
    }

    @Post('login')
    async login(@Body() body: LoginUserDto, @Res({ passthrough: true }) res: express.Response) {
        const { accessToken, refreshToken, user } = await firstValueFrom(this.authServiceClient.send("auth-loginUser", body));
        res.cookie('access-token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            path: '/',
            expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });
        res.cookie('refresh-token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            path: '/',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        return { message: "Login successful", user };
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@User() user: { userId: string }, @Res({ passthrough: true }) res: express.Response) {
        const userId = user.userId;
        res.clearCookie('access-token', { path: '/' });
        res.clearCookie('refresh-token', { path: '/' });
        return this.authServiceClient.send("auth-logout", userId);
    }

    @Post('refresh')
    async refreshToken(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        const oldRefreshToken = req.cookies['refresh-token'];
        if (!oldRefreshToken) throw new UnauthorizedException("Refresh token not found!");

        const { accessToken, refreshToken } = await firstValueFrom(this.authServiceClient.send("auth-refreshtoken", oldRefreshToken));

        res.cookie('access-token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            path: '/',
            expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });
        res.cookie('refresh-token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            path: '/',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        
        return { message: "Token refreshed successfully" };
    }
}
