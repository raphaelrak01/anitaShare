import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

import { AvatarUploadService } from './avatar-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from '@supabase/supabase-js';
import { ValidateImagePipe } from 'src/common/pipes/validata-image.pipe';
@ApiTags('Upload Avatar Image')
@Controller('avatar-upload')
export class AvatarUploadController {
  constructor(private readonly avatarUploadService: AvatarUploadService) {}
  @Post()
  @SupabaseGuard()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile(ValidateImagePipe) file: Express.Multer.File,
    @CurrentUser() currentUser: AuthUser,
  ) {
    return await this.avatarUploadService.uploadAvatar(file, currentUser);
  }
}
