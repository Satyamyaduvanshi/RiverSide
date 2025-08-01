import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'start_recording' })
  startRecording(@Payload() data: any) {
    return this.appService.startRecording(data);
  }

  @MessagePattern({cmd:"stop_recording"})
  stopRecording(@Payload() data:any){
    return this.appService.StopRecording(data)
  }
}