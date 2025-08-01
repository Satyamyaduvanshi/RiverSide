import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const User = createParamDecorator(
    (data:unknown,ctx: ExecutionContext)=>{
        const req = ctx.switchToHttp().getRequest()
        const user = req.user
        if(!user) throw new UnauthorizedException("user not found on request object")
        return user
    }
)