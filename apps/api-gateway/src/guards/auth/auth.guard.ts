import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    
    const token = req.cookies['access-token'];

    if (!token) {
      throw new UnauthorizedException('Missing token!');
    }

    try {
      const response = await firstValueFrom(
        this.authClient.send('validate-token', token)
      );

      if (!response.valid) {
        throw new UnauthorizedException('Invalid token');
      }

      //req['user'] = { userId: response.userId };
      req['user'] = { userId: response.userId, role: response.role };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed or service unavailable');
    }
  }
}