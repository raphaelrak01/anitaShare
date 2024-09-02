import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FliiinkerProfileImageService } from './fliiinker-profile-image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from '@supabase/supabase-js';
import { ValidateImagePipe } from 'src/common/pipes/validata-image.pipe';
import { UploadProfilePicturesDto } from './dtos/upload-fliiinker-profiles-pictures.dto';
@ApiTags('Upload Fliiinker profile Image')
@Controller('fliiinker-profile-image')
export class FliiinkerProfileImageController {
  constructor(
    private readonly fliiinkerPicturesService: FliiinkerProfileImageService,
  ) {}

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
        img_order: {
          type: 'integer',
          enum: [1, 2, 3],
          description: 'Order of the uploaded image (1, 2 or 3)',
        },
      },
    },
  })
  async uploadProfilePictureFliiinker(
    @UploadedFile(ValidateImagePipe) file: Express.Multer.File,
    @CurrentUser() currentUser: AuthUser,
    @Body() body: UploadProfilePicturesDto,
  ) {
    console.log(body);
    return await this.fliiinkerPicturesService.uploadFliiinkerPicture(
      file,
      currentUser,
      body,
    );
  }
}
