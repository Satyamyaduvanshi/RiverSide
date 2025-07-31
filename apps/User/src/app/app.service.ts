import { Injectable, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PrismaService } from '../../../../packages/prisma/src';

@Injectable()
export class AppService {
  constructor(private readonly prisma:PrismaService){}
  async getProfile(userId:string){
    const user = await this.prisma.user.findUnique(
     { where:{
        id:userId
      }}
    )
    if(!user) throw new NotFoundException("user not found!")
    //{remove password and refreshToken form user}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars 
    const {password,refreshToken, ...profile} = user;
    return profile
  }
}
