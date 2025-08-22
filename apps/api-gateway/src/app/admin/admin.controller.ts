import { Controller, Get, Inject, Param, Patch, UseGuards } from '@nestjs/common';
import { MICROSERVICE } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { Roles } from '../../decorator/roles.decorator';
import { RolesGuard } from '../../guards/role/roles.guard';

@Controller('admin')
export class AdminController {
    constructor( @Inject(MICROSERVICE.admin) private readonly adminService:ClientProxy){}


    @Get("users")
    @Roles('ADMIN')
    @UseGuards(AuthGuard,RolesGuard)
    getAllUser(){
       return this.adminService.send({cmd:"get_all_user"},{})
    }


    @Patch("users/:id/ban")
    @Roles('ADMIN')
    @UseGuards(AuthGuard,RolesGuard)
    banUser(@Param('id') userId:string){
        return this.adminService.send({cmd:"ban_user"},userId)
    }



}
