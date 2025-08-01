import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStudioDto } from './dto/createStudio.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({cmd: "studio-createStudio"})
  async createStudio(@Payload() data:{ownerId:string,studioData:CreateStudioDto}){
    return this.appService.createStudio(data.studioData,data.ownerId)
  }
}
