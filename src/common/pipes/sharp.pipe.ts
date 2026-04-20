import { Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// ✅ Custom Pipe — Image processing
@Injectable()
export class SharpPipe implements PipeTransform<Express.Multer.File, Promise<string>> {
  async transform(image: Express.Multer.File): Promise<string> {
    const filename = `${uuidv4()}.webp`;

    await sharp(image.buffer)
      .resize(800)
      .webp({ effort: 3 })
      .toFile(path.join('uploads', filename));

    return filename;
  }
}