import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PrismaService } from '../../../../packages/prisma/src';
import { CreateStudioDto } from './dto/createStudio.dto';

@Injectable()
export class AppService {

  constructor(private readonly prisma:PrismaService){}
 
  async createStudio(data:CreateStudioDto,ownerId:string){
    return await this.prisma.studio.create({
      data:{
        title: data.title,
        ownerId: ownerId,
        participants:{
          create:{
            userId: ownerId,
            role: 'HOST'
          }
        }
      },
      include:{
        participants:true
      }
    })
  }

  async joinStudio(studioId: string, userId: string) {
  // Find or create a participant record for this user in this studio
  return this.prisma.participant.upsert({
    where: {
      studioId_userId: { // This compound key was defined in our schema
        userId,
        studioId,
      },
    },
    update: {}, // Nothing to update if they already exist
    create: {
      userId,
      studioId,
      role: 'GUEST', // We could add logic later to make the owner a HOST
    },
  });
}



}
