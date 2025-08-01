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
}
