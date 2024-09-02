import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class ValidateImagePipe implements PipeTransform {
  transform(file: any, metadata: ArgumentMetadata) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Vérifier le type MIME pour s'assurer que le fichier est une image
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      // console.log('MIME Type List:', allowedMimeTypes);

      // console.log('MIME type not allowed:', file.mimetype);

      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }

    // Vérifier la taille du fichier pour s'assurer qu'il ne dépasse pas 5 Mo
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 Mo
    if (file.size > maxSizeInBytes) {
      throw new BadRequestException('File size exceeds the limit of 5MB.');
    }

    return file;
  }
}
