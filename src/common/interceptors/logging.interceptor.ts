import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// ✅ Interceptor — logging des requêtes
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const request = ctx.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = ctx.switchToHttp().getResponse();
          const contentLength = response.get('content-length');
          this.logger.log(
            `${method} ${url} ${response.statusCode} ${contentLength} - ${userAgent} ${ip} +${Date.now() - now}ms`,
          );
        },
        error: (error) => {
          this.logger.error(
            `${method} ${url} ${error.status} - ${userAgent} ${ip} +${Date.now() - now}ms`,
          );
        },
      }),
    );
  }
}