import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class StopRecordingDto {
  @IsUUID()
  @IsNotEmpty()
  recordingId: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsNumber()
  @IsNotEmpty()
  fileSize: number;
}