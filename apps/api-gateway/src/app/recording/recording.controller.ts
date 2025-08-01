import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StartRecordingDto } from './dto/start-recording.dto';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express'; 
import { diskStorage } from 'multer'; 

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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}`);
        },
      }),
    }),
  )
  stopRecording(
    @UploadedFile() file: Express.Multer.File,
    @Body('recordingId') recordingId: string,
  ) {
    const payload = {
      recordingId: recordingId,
      filePath: file.path,
      fileSize: file.size,
    };
    return this.recordingServiceClient.send(
      { cmd: 'stop_recording' },
      payload,
    );
  }
}