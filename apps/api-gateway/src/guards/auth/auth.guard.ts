import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICE } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(@Inject(MICROSERVICE.auth) private readonly authClient: ClientProxy) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = req.cookies['access-token'];
        if (!token) {
            throw new UnauthorizedException("Missing access token!");
        }
        try {
            const response = await firstValueFrom(this.authClient.send("validate-token", token));
            if (!response || !response.valid) {
                throw new UnauthorizedException("Invalid token");
            }
            req.user = { userId: response.userId };
            return true;
        } catch (error) {
            throw new UnauthorizedException("Token validation failed");
        }
    }
}
