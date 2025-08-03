import { Module } from '@nestjs/common';
import { StudioGateway } from './studio.gateway';

@Module({
  providers: [StudioGateway],
})
export class GatewayModule {}