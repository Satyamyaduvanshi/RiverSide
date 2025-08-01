import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StartRecordingDto {
  @IsUUID()
  @IsNotEmpty()
  studioId: string;

  @IsUUID()
  @IsNotEmpty()
  participantId: string;

  @IsString()
  @IsIn(['audio', 'video'])
  fileType: 'audio' | 'video';
}