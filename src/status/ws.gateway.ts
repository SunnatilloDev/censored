import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({ namespace: '/status' })
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  users = new Map<string, { userId: number; lastOnline: Date }>();

  constructor(private prismaService: PrismaService) {}

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    console.log('Connection attempt:', client.id, 'with userId:', userId);

    if (!isNaN(userId)) {
      this.users.set(client.id, { userId, lastOnline: new Date() });
      console.log(`User ${userId} connected.`);
      this.updateUserStatus(userId, 'online');
    } else {
      console.error('Invalid user ID:', client.handshake.query.userId);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userData = this.users.get(client.id);
    if (userData) {
      userData.lastOnline = new Date();
      console.log(`User ${userData.userId} disconnected.`);
      this.updateUserStatus(userData.userId, 'offline', userData.lastOnline);
      this.users.delete(client.id);
    }
  }

  async updateUserStatus(userId: number, status: string, lastOnline?: Date) {
    console.log(`Emitting status update for User ${userId}:`, status);

    // Check if user exists
    const userExists = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.error(`User with ID ${userId} not found.`);
      return;
    }

    if (status === 'online') {
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          status,
        },
      });
      this.server.emit('status-update', { userId, status });
    } else {
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          status,
          lastOnline: lastOnline,
        },
      });
      this.server.emit('status-update', {
        userId,
        status,
        lastOnline: lastOnline?.toISOString(),
      });
    }
  }
}
