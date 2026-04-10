import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId && !req.path.includes('/auth/') && !req.path.includes('/health')) {
      // On peut aussi le rendre optionnel pour certaines routes
    }

    req['tenantId'] = tenantId || 'default';
    next();
  }
}