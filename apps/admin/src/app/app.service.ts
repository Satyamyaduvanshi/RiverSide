import { Injectable, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PrismaService } from '../../../../packages/prisma/src';


@Injectable()
export class AppService {

  constructor(private readonly prisma: PrismaService){}

  getAllUser(){
    return this.prisma.user.findMany({

      select:{
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isBanned: true,
        role: true
      }
    })
  }

  banUser(userId: string){

    const user = this.prisma.user.findUnique({
      where:{
        id:userId
      }
    })

    if(!user) throw new NotFoundException("user not found")

    return this.prisma.user.update({
      where:{
        id: userId
      },
      data:{
        isBanned: true
      }
    })
  }

  
}
