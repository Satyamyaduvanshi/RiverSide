import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth/auth.guard';

@Controller('user')
export class UserController {


    @UseGuards((AuthGuard))
    @Get()
    async getUserProfile(@Req() req){
        const userId = req.user.userId
        return {}
    }
}
