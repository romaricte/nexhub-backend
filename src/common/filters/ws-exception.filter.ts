import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

// ✅ Exception Filter pour WebSocket
@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const error = exception.getError();

    client.emit('error', {
      status: 'error',
      message: typeof error === 'string' ? error : (error as any).message,
      timestamp: new Date().toISOString(),
    });
  }
}