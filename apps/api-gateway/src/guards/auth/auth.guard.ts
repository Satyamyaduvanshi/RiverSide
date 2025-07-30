import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICE } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(@Inject(MICROSERVICE.auth) private readonly authClient:ClientProxy){}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    
    const req = await context.switchToHttp().getRequest()
    const authHeader = req.Headers["authorization"] as string
    if(!authHeader) throw new UnauthorizedException("missing token!")
    const token = authHeader.split(" ")[1];

    const response = await firstValueFrom( this.authClient.send("validate-token",token))

    if(!response.valid) throw new UnauthorizedException("Invalid token")

    req.user = {userId: response.userId}

    return true
  } 
}
