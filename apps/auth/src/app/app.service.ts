import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

  //create user
  async createUser(userData: CreateUserDto) {
    const emailMatch = await this.findUserByEmail(userData.email);
    if (emailMatch) {
        throw new ConflictException('User with this email already exists');
    }
    return this.create(userData);
  }

  // login user
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

  //logout user
  logout(userId: string) {
    this.updateRefreshToken(userId, null)
    return {message: "user logout"}
  }

  //refresh token

  async refreshTokenRotation(token: string) {

    try {
      const {sub} = await this.jwtService.verify(token)
      const user = await this.findById(sub)
      if(!user || !user.refreshToken ) throw new UnauthorizedException("")
      const isMatch = await verify(user.refreshToken,token)
      if(isMatch) throw new UnauthorizedException("token mismatch");
      return this.login(user.id,user.firstName)
      
    } catch (err) {
      throw new UnauthorizedException("invalid refresh token")
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

  async validateToken(token:string){
    try {
       const decode:authJwtPayload = this.jwtService.verify(token)
       return {valid: true , userId: decode.sub}
    } catch (err) {
      return { valid:false, userId: null}
    }
  }



}
