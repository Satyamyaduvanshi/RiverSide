import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StartRecordingDto } from './dto/start-recording.dto';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { StopRecordingDto } from './dto/stop-recording.dto';

@Controller('recording')
export class RecordingController {
  constructor(
    @Inject('RECORDING_SERVICE')
    private readonly recordingServiceClient: ClientProxy,
  ) {}

  @Post('start')
  @UseGuards(AuthGuard)
  startRecording(@Body() startRecordingDto: StartRecordingDto) {
    return this.recordingServiceClient.send(
      { cmd: 'start_recording' },
      startRecordingDto,
    );
  }

  @Post('stop')
  @UseGuards(AuthGuard)
  stopRecording(@Body() stopRecordingDto: StopRecordingDto) {
    return this.recordingServiceClient.send(
      { cmd: 'stop_recording' },
      stopRecordingDto,
    );
  }
}