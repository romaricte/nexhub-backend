import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import * as winston from 'winston';

// ✅ Custom Logger avec Request Scope
@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger {
  private winstonLogger: winston.Logger;

  constructor() {
    super();
    this.winstonLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  log(message: string, context?: string) {
    super.log(message, context);
    this.winstonLogger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    this.winstonLogger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
    this.winstonLogger.warn(message, { context });
  }
}