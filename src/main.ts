import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  VersioningType,
  Logger,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CustomLogger } from './common/logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // ✅ Custom Logger
  app.useLogger(new CustomLogger());

  // ✅ Security
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // ✅ CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // ✅ API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ✅ Global Prefix
  app.setGlobalPrefix('api');

  // ✅ Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ✅ Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // ✅ Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ✅ Swagger
  const config = new DocumentBuilder()
    .setTitle('NexHub API')
    .setDescription('Multi-Tenant Marketplace API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'api-key')
    .addTag('auth')
    .addTag('users')
    .addTag('products')
    .addTag('orders')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // ✅ Graceful Shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`🚀 Application running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`📚 Swagger: http://localhost:${port}/docs`, 'Bootstrap');
}
bootstrap();