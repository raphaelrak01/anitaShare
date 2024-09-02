import { IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadProfilePicturesDto {
  @Type(() => Number) // Convertit la chaîne en nombre avant la validation
  @IsInt()
  @IsIn([1, 2, 3], { message: 'img_order must be 1, 2, or 3' })
  img_order: number;
}
