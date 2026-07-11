import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * Gateway responsible for real-time comment notifications.
 * Clients join a personal room (their userId) to receive targeted events.
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/comments',
})
export class CommentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CommentGateway.name);

  handleConnection(client: Socket): void {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    } else {
      this.logger.warn(`Client connected without userId: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Allow a client to explicitly join a user room (e.g. after auth).
   */
  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket): void {
    if (data?.userId) {
      client.join(`user:${data.userId}`);
      this.logger.log(`Client ${client.id} joined room user:${data.userId}`);
    }
  }

  /**
   * Allow a client to join a course room to receive course-wide events.
   */
  @SubscribeMessage('joinCourse')
  handleJoinCourse(
    @MessageBody() data: { courseId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    if (data?.courseId) {
      client.join(`course:${data.courseId}`);
      this.logger.log(`Client ${client.id} joined room course:${data.courseId}`);
    }
  }

  // ---- Emit helpers ----

  /**
   * Notify each recipient of a new comment and, if applicable, the course room.
   */
  notifyNewComment(comment: any): void {
    const recipientIds: string[] = comment.recipientIds || [];
    recipientIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('comment:new', comment);
    });
    if (comment.courseId) {
      this.server.to(`course:${comment.courseId}`).emit('comment:new', comment);
    }
  }

  notifyUpdatedComment(comment: any): void {
    const recipientIds: string[] = comment.recipientIds || [];
    recipientIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('comment:updated', comment);
    });
    this.server.to(`user:${comment.authorId}`).emit('comment:updated', comment);
    if (comment.courseId) {
      this.server.to(`course:${comment.courseId}`).emit('comment:updated', comment);
    }
  }

  notifyDeletedComment(commentId: string, recipientIds: string[], courseId?: string): void {
    recipientIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('comment:deleted', { id: commentId });
    });
    if (courseId) {
      this.server.to(`course:${courseId}`).emit('comment:deleted', { id: commentId });
    }
  }

  notifyReaction(comment: any): void {
    this.server.to(`user:${comment.authorId}`).emit('comment:reaction', comment);
    const recipientIds: string[] = comment.recipientIds || [];
    recipientIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('comment:reaction', comment);
    });
  }
}
