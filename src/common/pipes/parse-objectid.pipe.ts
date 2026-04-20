import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

// ✅ Custom Pipe
@Injectable()
export class ParseUUIDOrFail implements PipeTransform<string> {
  transform(value: string): string {
    if (!isUUID(value)) {
      throw new BadRequestException(`"${value}" is not a valid UUID`);
    }
    return value;
  }
}