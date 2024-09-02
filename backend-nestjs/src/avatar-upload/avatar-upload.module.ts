import { Module } from '@nestjs/common';
import { AvatarUploadService } from './avatar-upload.service';
import { AvatarUploadController } from './avatar-upload.controller';
import { UsersModule } from 'src/users/users.module';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  providers: [AvatarUploadService],
  controllers: [AvatarUploadController],
  imports: [SupabaseModule, UsersModule],
})
export class AvatarUploadModule {}
