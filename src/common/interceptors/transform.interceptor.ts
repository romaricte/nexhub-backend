import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    path: string;
    statusCode: number;
  };
}

// ✅ Interceptor — transforme TOUTES les réponses
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = ctx.switchToHttp().getRequest();
    const response = ctx.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          path: request.url,
          statusCode: response.statusCode,
        },
      })),
    );
  }
}