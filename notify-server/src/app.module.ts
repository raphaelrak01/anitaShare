import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { NotifyModule } from './notify/notify.module';
import { SocketModule } from './socket/socket.module';
import { RedisModule } from './redis/redis.module';
import { CommonModule } from './common/common.module';
import { FirebaseModule } from 'nestjs-firebase';
import { QueuesModule } from './queues/queues.module';
import { ConfigModule } from '@nestjs/config';
import { environnement } from './common/environnement';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      load: [environnement],
    }),
    FirebaseModule.forRoot({
      googleApplicationCredential: environnement().fcm.configPath,
    }),
    NotifyModule,
    SocketModule,
    RedisModule,
    CommonModule,
    QueuesModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
