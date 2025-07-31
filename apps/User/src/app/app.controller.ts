import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern("user-getProfile")
  async getProfile(@Payload() userId:string){
    return this.appService.getProfile(userId)
  }
}