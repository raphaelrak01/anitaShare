import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as sharp from 'sharp';
import { AuthUser } from '@supabase/supabase-js';
import { Supabase } from 'src/supabase/supabase';
import { convertToWebP } from 'src/common/utils/image-conversion.util';
@Injectable()
export class AvatarUploadService {
  private readonly logger = new Logger(AvatarUploadService.name);
  constructor(private readonly supabase: Supabase) {}

  async uploadAvatar(file: Express.Multer.File, currentUser: AuthUser) {
    if (!file) {
      this.logger.error(currentUser);

      throw new BadRequestException('No file uploaded');
    }
    // console.log(file.mimetype);
    // Conversion de l'image en WEBP avec sharp
    const webpBuffer = await convertToWebP(file.buffer, { quality: 60 });

    // Upload du fichier converti sur Supabase
    const { data, error } = await this.supabase
      .getClient()
      .storage.from('avatars')
      .upload(`${currentUser.id}/avatar.webp`, webpBuffer, {
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
