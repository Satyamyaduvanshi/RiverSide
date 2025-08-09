import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({cmd:"get_presigned_url"})
  getPresignedURL(@Payload() filename:string){
    return this.appService.getPresignedUploadUrl(filename)
  }

}