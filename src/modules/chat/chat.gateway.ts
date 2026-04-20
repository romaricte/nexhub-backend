import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayInit,
  OnGatewayConnection, OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UseFilters, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';
import { WsExceptionFilter } from '../../common/filters/ws-exception.filter';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';

// ✅ WebSocket Gateway avec TOUT
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
  },
})
@UseGuards(WsAuthGuard) // ✅ Guard WebSocket
@UseFilters(WsExceptionFilter) // ✅ Filter WebSocket
@UsePipes(new ValidationPipe({ transform: true })) // ✅ Pipe WebSocket
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private activeUsers = new Map<string, { socketId: string; userId: string }>();

  constructor(private chatService: ChatService) {}

  // ✅ Lifecycle Hooks WebSocket
  afterInit(server: Server) {
    this.logger.log('Chat WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.chatService.authenticateSocket(client);
      this.activeUsers.set(client.id, {
        socketId: client.id,
        userId: user.id,
      });

      // Rejoindre la room personnelle
      client.join(`user:${user.id}`);

      // Notifier tout le monde
      this.server.emit('userOnline', { userId: user.id });

      this.logger.log(`Client connected: ${client.id} (User: ${user.id})`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.activeUsers.get(client.id);
    if (user) {
      this.server.emit('userOffline', { userId: user.userId });
      this.activeUsers.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ✅ Message handlers
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    await this.chatService.validateRoomAccess(client['user'].id, dto.roomId);
    client.join(`room:${dto.roomId}`);

    // Charger l'historique
    const history = await this.chatService.getRoomHistory(dto.roomId, 50);

    return { event: 'roomJoined', data: { roomId: dto.roomId, history } };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const user = this.activeUsers.get(client.id);
    if (!user) throw new WsException('Not authenticated');

    const message = await this.chatService.saveMessage({
      content: dto.content,
      roomId: dto.roomId,
      senderId: user.userId,
      type: dto.type || 'text',
    });

    // ✅ Émettre à toute la room
    this.server.to(`room:${dto.roomId}`).emit('newMessage', message);

    return { event: 'messageSent', data: message };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = this.activeUsers.get(client.id);
    client.to(`room:${data.roomId}`).emit('userTyping', {
      userId: user.userId,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('directMessage')
  async handleDirectMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string; content: string },
  ) {
    const user = this.activeUsers.get(client.id);

    const message = await this.chatService.saveDirectMessage({
      senderId: user.userId,
      recipientId: data.recipientId,
      content: data.content,
    });

    // ✅ Émettre au destinataire
    this.server
      .to(`user:${data.recipientId}`)
      .emit('directMessage', message);

    return { event: 'directMessageSent', data: message };
  }

  // ✅ Méthode appelée depuis d'autres services
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}