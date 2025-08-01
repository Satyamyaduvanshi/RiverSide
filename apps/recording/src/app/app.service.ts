import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {PrismaService} from "../../../../packages/prisma/src"

export interface startRecordingDto{
  studioId: string;
  participantId: string;
  fileType: 'audio' | 'video';
}

export interface stopRecordingDto{
  recordingId: string;
  filePath:string,
  fileSize:number
}

@Injectable()
export class AppService {
 
  constructor(private readonly prisma:PrismaService){}


    //  creates a record in the database when a recording starts.
    //  filePath and fileSize will be updated later.
  async startRecording(data:startRecordingDto) {
    return await this.prisma.recording.create({
      data:{
        studioId: data.studioId,
        participantId: data.participantId,
        fileType: data.fileType,
        filePath: 'placeholder/path', // I will update this later
        fileSize: 0,
      }
    })
  }

  async StopRecording(data:stopRecordingDto){
    return await this.prisma.recording.update({
      where:{
        id: data.recordingId
      },
      data:{
        filePath:data.filePath,
        fileSize: data.fileSize,
        endedAt: new Date()
        
      }
    })
  }
 
  
  
}
