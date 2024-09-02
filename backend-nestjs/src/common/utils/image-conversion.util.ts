import * as sharp from 'sharp';

export async function convertToWebP(
  buffer: Buffer,
  options: sharp.WebpOptions = {},
): Promise<Buffer> {
  return await sharp(buffer).webp(options).toBuffer();
}
