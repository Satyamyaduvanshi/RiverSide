import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @MessagePattern('auth-createUser')
  async createUser(@Payload() userData:CreateUserDto){
    return this.appService.createUser(userData)
  }

  

  @MessagePattern("auth-loginUser")
  async login(@Payload() userData:LoginUserDto){
    return this.appService.login(userData)
  }

  
}
