import { Module } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { HttpModule } from '@nestjs/axios';
import { NotifyController } from './notify.controller';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [HttpModule, QueuesModule],
  providers: [NotifyService],
  exports: [NotifyService],
  controllers: [NotifyController],
})
export class NotifyModule {}
