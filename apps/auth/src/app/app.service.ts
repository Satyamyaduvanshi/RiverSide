import { ConflictException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
//import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, verify } from 'argon2';
import { LoginUserDto } from './dto/login-user.dto';
import { authJwtPayload } from './types/jwt-plyload.types';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from './config/refresh.config';
import * as config from '@nestjs/config';

@Injectable()
export class AppService {

  constructor(
    private readonly prisma:PrismaService,
    private readonly jwtService:JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: config.ConfigType<typeof refreshConfig>,
  ){}

  
  async createUser(userData: CreateUserDto) {
    const emailMatch = await this.findUserByEmail(userData.email);
    if (emailMatch) {
        throw new ConflictException('User with this email already exists');
    }
    return this.create(userData);
}

  async login(userId:string,name:string) {
    const {accessToken,refreshToken} = await this.generateToken(userId)
    const hashRfT = await hash(refreshToken)
    this.updateRefreshToken(userId,hashRfT)
    return {
      id:userId,
      name,
      accessToken,
      refreshToken
    }
  }

// user funcation's
  async findUserByEmail(email:string){
     return await this.prisma.user.findUnique({
      where:{
        email
      }
    })
  }

  async findById(id:string){
    return this.prisma.user.findUnique({
      where:{
        id:id,
      }
    })
  }

  async updateRefreshToken(userId:string,hashRfT:string | null){
    return this.prisma.user.update({
      where:{
        id:userId
      },
      data:{
        refreshToken:hashRfT
      }
    })
  }


  // auth funcation's

  async create(createUser:CreateUserDto){
    const {password, ...user} = createUser;
    const hashPassword = await hash(password);
    return await this.prisma.user.create({
      data:{
        password:hashPassword,
        ...user
      }
    })
  }


  async validateUser(userData:LoginUserDto){
    const user = await this.findUserByEmail(userData.email)
    if(!user) throw new UnauthorizedException("user not found");
    const isPasswordMatch = await verify(user.password,userData.password)
    if(!isPasswordMatch) throw new UnauthorizedException("Invalid credentials")
    return {id: user.id, name: user.firstName}
  }

  async generateToken(userId:string){
    const payload:authJwtPayload={
      sub:userId
    }
    const [accessToken,refreshToken]= await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload,this.refreshTokenConfig)
    ])
    return {
      accessToken,
      refreshToken
    }
  }

}
