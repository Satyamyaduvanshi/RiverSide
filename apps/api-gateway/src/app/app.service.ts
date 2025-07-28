import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello! this is a gateway API (starting api for this microservice project)' };
  }
}
