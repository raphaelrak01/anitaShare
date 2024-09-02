import { Module } from '@nestjs/common';
import { FliiinkerProfileImageService } from './fliiinker-profile-image.service';
import { FliiinkerProfileImageController } from './fliiinker-profile-image.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [FliiinkerProfileImageService],
  controllers: [FliiinkerProfileImageController],
  imports: [SupabaseModule, UsersModule],
})
export class FliiinkerProfileImageModule {}
