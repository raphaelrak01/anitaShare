import { Module } from '@nestjs/common';
import { NotifyService } from './notify.service';

import { NotifyController } from './notify.controller';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [SocketModule],
  providers: [NotifyService],
  controllers: [NotifyController],
  exports: [NotifyService],
})
export class NotifyModule {}
