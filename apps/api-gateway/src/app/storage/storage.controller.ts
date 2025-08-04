import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { MICROSERVICE } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';
import { PresignedUrlDto } from './dto/fileName.dto';
import { AuthGuard } from '../../guards/auth/auth.guard';

@Controller('storage')
export class StorageController {

    constructor(@Inject(MICROSERVICE.storage) private readonly storageService:ClientProxy){}


    @Post("presigned-url")
    @UseGuards(AuthGuard)
    getPresignedURL(@Body() preSignedUrl:PresignedUrlDto){
        return this.storageService.send(
            {cmd:'get_presigned_url' },
            preSignedUrl.fileName
        )
    }
}
