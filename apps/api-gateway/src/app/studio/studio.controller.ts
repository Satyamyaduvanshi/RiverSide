import { Body, Controller, Inject, Param, Post, UseGuards } from '@nestjs/common';
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

  @Post(':id/join')
  @UseGuards(AuthGuard)
  joinStudio(@Param('id') studioId: string, @User() user:{userId:string}) {
    const userId = user.userId;
    return this.studioService.send(
      { cmd: 'join_studio' },
      { studioId, userId },
    );
  }
}