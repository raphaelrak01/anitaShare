import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import { AuthUser } from '@supabase/supabase-js';
import { Supabase } from 'src/supabase/supabase';
import { UploadProfilePicturesDto } from './dtos/upload-fliiinker-profiles-pictures.dto';
import { convertToWebP } from 'src/common/utils/image-conversion.util';
@Injectable()
export class FliiinkerProfileImageService {
  private readonly logger = new Logger(FliiinkerProfileImageService.name);
  constructor(private readonly supabase: Supabase) {}

  async uploadFliiinkerPicture(
    file: Express.Multer.File,
    currentUser: AuthUser,
    body: UploadProfilePicturesDto,
  ) {
    const webpBuffer = await convertToWebP(file.buffer, { quality: 60 });
    const { data, error } = await this.supabase
      .getClient()
      .storage.from('fliiinker_pictures')
      .upload(`${currentUser.id}/IMG_${body?.img_order}.webp`, webpBuffer, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '3600',
      });
    if (error) {
      throw new Error(`Erreur d'upload sur Supabase: ${error.message}`);
    }

    return data;
  }
}
