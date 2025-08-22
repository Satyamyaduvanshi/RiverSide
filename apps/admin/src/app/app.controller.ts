import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({cmd: "get_all_user"})
  getAllUser(){
    return this.appService.getAllUser();
  }

  @MessagePattern({cmd:"ban_user"})
  banUser(@Payload() userId:string){
    return this.appService.banUser(userId)
  }
}
