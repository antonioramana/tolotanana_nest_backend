import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private jwtService: JwtService, private configService: ConfigService) {}

  async handleConnection(client: Socket) {
    try {
      // Vérifier le token JWT
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Connexion WebSocket sans token');
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      const userId = payload.sub || payload.id;

      if (!userId) {
        this.logger.warn('Token JWT invalide pour WebSocket');
        client.disconnect();
        return;
      }

      // Associer l'utilisateur à sa socket
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      this.logger.log(`Utilisateur ${userId} connecté (socket: ${client.id})`);
      
      // Envoyer un message de bienvenue
      client.emit('connected', {
        message: 'Connecté aux notifications en temps réel',
        userId,
      });

    } catch (error) {
      this.logger.error('Erreur lors de la connexion WebSocket:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`Utilisateur ${userId} déconnecté (socket: ${client.id})`);
    }
  }

  // Envoyer une notification à un utilisateur spécifique
  sendToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log(`Notification envoyée à l'utilisateur ${userId}`);
    } else {
      this.logger.warn(`Utilisateur ${userId} non connecté, notification non envoyée`);
    }
  }

  // Envoyer une notification à tous les utilisateurs connectés
  sendToAll(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Notification envoyée à tous les utilisateurs connectés');
  }

  // Envoyer une notification à plusieurs utilisateurs
  sendToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => this.sendToUser(userId, notification));
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} a rejoint la room ${data.room}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} a quitté la room ${data.room}`);
  }

  @SubscribeMessage('mark_notification_read')
  handleMarkNotificationRead(@MessageBody() data: { notificationId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      // Ici vous pouvez implémenter la logique pour marquer la notification comme lue
      this.logger.log(`Notification ${data.notificationId} marquée comme lue par l'utilisateur ${userId}`);
    }
  }

  // Méthodes utilitaires
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
