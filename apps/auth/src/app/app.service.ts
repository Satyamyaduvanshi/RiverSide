import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
//import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, verify } from 'argon2';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AppService {

  constructor(
    private readonly prisma:PrismaService,
    //private jwtServive:JwtService
  ){}

  
  async createUser(userData: CreateUserDto) {
    try {
      const emailMatch = await this.findUserByEmail(userData.email)
    if(emailMatch) throw new ConflictException("user already exist!")
    return await this.create(userData)

    } catch (e) {
      console.error("error creating user: ",e)
      if(e instanceof ConflictException){
        throw e;
      }
      throw new InternalServerErrorException("an unexpected error occured during user creation.")
    }
  }

  async login(userData:LoginUserDto) {
    const 
  }

// user 
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
    const isPasswordMatch = verify(user.password,userData.password)
    if(!isPasswordMatch) throw new UnauthorizedException("Invalid credentials")
    return {id: user.id, name: user.firstName}
  }

}
