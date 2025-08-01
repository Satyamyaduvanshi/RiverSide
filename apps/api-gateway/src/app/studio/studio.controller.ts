import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '../../constant';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { User } from '../../decorator/user.decorator';
import { CreateStudioDto } from './dto/createStudio.dto';

@Controller('studio')
export class StudioController {

  constructor(
    @Inject(MICROSERVICE.studio) private readonly studioService: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Post('create-studio')
  async createStudio(
    @User() user: { userId: string },
    @Body() studioData: CreateStudioDto,
  ) {

    const payload = {
      ownerId: user.userId,
      studioData: studioData,
    };

    return this.studioService.send({ cmd: 'studio-createStudio' }, payload);
  }
}