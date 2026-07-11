import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type {
  ICommentRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../domain/comment/comment.repository.interface';
import { Comment, CommentType, CommentAttachment } from '../../domain/comment/comment.entity';
import {
  CommentNotFoundException,
  InvalidCommentTypeException,
  CommentNotAllowedException,
} from '../../domain/comment/comment.exceptions';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponseDto,
  PaginatedCommentResponseDto,
} from '../../presentation/dtos/comment.dto';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import { CommentGateway } from '../../presentation/gateways/comment.gateway';

@Injectable()
export class CommentService {
  constructor(
    @Inject('ICommentRepository') private commentRepository: ICommentRepository,
    private cloudinaryService: CloudinaryService,
    private commentGateway: CommentGateway,
  ) {}

  /**
   * Create a new comment
   * @param dto - Comment creation data
   * @returns The created comment
   */
  async create(dto: CreateCommentDto): Promise<CommentResponseDto> {
    // Validate comment type
    if (dto.type === CommentType.COURSE && !dto.courseId) {
      throw new BadRequestException('Course ID is required for course comments');
    }

    try {
      const attachments: CommentAttachment[] = (dto.attachments || []).map((a) => ({
        url: a.url,
        publicId: a.publicId,
        fileName: a.fileName,
        fileType: a.fileType,
        fileSize: a.fileSize,
      }));

      const comment = new Comment(
        dto.type,
        dto.content || '',
        dto.authorId,
        dto.recipientIds,
        dto.courseId,
        dto.parentId,
        attachments,
      );

      const savedComment = await this.commentRepository.save(comment);
      const response = this.mapToResponse(savedComment);

      // Real-time notification
      this.commentGateway.notifyNewComment(response);

      return response;
    } catch (error) {
      if (error.message.includes('Invalid comment type')) {
        throw new InvalidCommentTypeException(dto.type);
      }
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Upload a file attachment to Cloudinary
   * @param file - The uploaded file
   * @returns Attachment metadata
   */
  async uploadAttachment(file: Express.Multer.File): Promise<CommentAttachment> {
    const { url, publicId } = await this.cloudinaryService.uploadFile(file, {
      folder: 'comments/attachments',
      public_id: `attachment-${Date.now()}`,
    });
    return {
      url,
      publicId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    };
  }


  /**
   * Get a comment by ID
   * @param id - Comment ID
   * @returns The comment
   */
  async findById(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }
    return this.mapToResponse(comment);
  }

  /**
   * Get all comments from a course (paginated)
   */
  async findByCourseId(
    courseId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedCommentResponseDto> {
    const result = await this.commentRepository.findByCourseId(courseId, options);
    return this.mapPaginated(result);
  }

  /**
   * Get all comments by an author (paginated)
   */
  async findByAuthorId(
    authorId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedCommentResponseDto> {
    const result = await this.commentRepository.findByAuthorId(authorId, options);
    return this.mapPaginated(result);
  }

  /**
   * Get all comments sent to a user (paginated)
   */
  async findByRecipientId(
    recipientId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedCommentResponseDto> {
    const result = await this.commentRepository.findByRecipientId(recipientId, options);
    return this.mapPaginated(result);
  }

  /**
   * Get all course comments sent to a specific student (paginated)
   */
  async findCourseCommentsByRecipient(
    courseId: string,
    recipientId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedCommentResponseDto> {
    const result = await this.commentRepository.findCourseCommentsByRecipient(
      courseId,
      recipientId,
      options,
    );
    return this.mapPaginated(result);
  }

  /**
   * Get all replies to a comment
   */
  async findReplies(parentId: string): Promise<CommentResponseDto[]> {
    const comments = await this.commentRepository.findReplies(parentId);
    return comments.map((comment) => this.mapToResponse(comment));
  }

  /**
   * Get all comments (paginated)
   */
  async findAll(options?: PaginationOptions): Promise<PaginatedCommentResponseDto> {
    const result = await this.commentRepository.findAll(options);
    return this.mapPaginated(result);
  }

  /**
   * Full-text search across comments the user is involved in
   */
  async search(
    query: string,
    userId?: string,
    options?: PaginationOptions,
  ): Promise<PaginatedCommentResponseDto> {
    const result = await this.commentRepository.search(query, userId, options);
    return this.mapPaginated(result);
  }

  /**
   * Get archived comments/conversations for a user
   */
  async findArchivedByUser(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedCommentResponseDto> {
    const result = await this.commentRepository.findArchivedByUser(userId, options);
    return this.mapPaginated(result);
  }


  /**
   * Update a comment
   * @param id - Comment ID
   * @param userId - User ID (for authorization)
   * @param dto - Update data
   * @returns The updated comment
   */
  async update(id: string, userId: string, dto: UpdateCommentDto): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }

    // Authorization: only the author can update
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can update this comment');
    }

    if (dto.content !== undefined) {
      comment.content = dto.content;
    }

    if (dto.recipientIds !== undefined) {
      comment.recipientIds = dto.recipientIds;
    }

    const updatedComment = await this.commentRepository.update(id, comment);
    if (!updatedComment) {
      throw new CommentNotFoundException(id);
    }

    const response = this.mapToResponse(updatedComment);
    this.commentGateway.notifyUpdatedComment(response);
    return response;
  }

  /**
   * Delete a comment (hard delete)
   * @param id - Comment ID
   * @param userId - User ID (for authorization)
   */
  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }

    // Authorization: only the author can delete
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this comment');
    }

    // Clean up attachments from Cloudinary
    await this.cleanupAttachments(comment);

    await this.commentRepository.delete(id);
    this.commentGateway.notifyDeletedComment(id, comment.recipientIds, comment.courseId);
  }

  /**
   * Soft delete a comment (mark as deleted)
   * @param id - Comment ID
   * @param userId - User ID (for authorization)
   * @returns The soft deleted comment
   */
  async softDelete(id: string, userId: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }

    // Authorization: only the author can delete
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this comment');
    }

    const deletedComment = await this.commentRepository.softDelete(id);
    if (!deletedComment) {
      throw new CommentNotFoundException(id);
    }

    this.commentGateway.notifyDeletedComment(id, comment.recipientIds, comment.courseId);
    return this.mapToResponse(deletedComment);
  }

  // ---- Reactions ----

  /**
   * Add or replace a reaction on a comment (one reaction per user)
   */
  async addReaction(id: string, userId: string, emoji: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }
    const updated = await this.commentRepository.addReaction(id, userId, emoji);
    if (!updated) {
      throw new CommentNotFoundException(id);
    }
    const response = this.mapToResponse(updated);
    this.commentGateway.notifyReaction(response);
    return response;
  }

  /**
   * Remove a user's reaction from a comment
   */
  async removeReaction(id: string, userId: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }
    const updated = await this.commentRepository.removeReaction(id, userId);
    if (!updated) {
      throw new CommentNotFoundException(id);
    }
    const response = this.mapToResponse(updated);
    this.commentGateway.notifyReaction(response);
    return response;
  }

  // ---- Attachments ----

  /**
   * Upload and attach a file to an existing comment
   */
  async addAttachment(
    id: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can add attachments');
    }
    const attachment = await this.uploadAttachment(file);
    const updated = await this.commentRepository.addAttachment(id, attachment);
    if (!updated) {
      throw new CommentNotFoundException(id);
    }
    const response = this.mapToResponse(updated);
    this.commentGateway.notifyUpdatedComment(response);
    return response;
  }

  /**
   * Remove an attachment from a comment (also deletes from Cloudinary)
   */
  async removeAttachment(
    id: string,
    userId: string,
    publicId: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can remove attachments');
    }
    try {
      await this.cloudinaryService.deleteFile(publicId);
    } catch (error) {
      // Log but continue removing the DB reference
      console.log('Error deleting attachment from Cloudinary:', error.message);
    }
    const updated = await this.commentRepository.removeAttachment(id, publicId);
    if (!updated) {
      throw new CommentNotFoundException(id);
    }
    const response = this.mapToResponse(updated);
    this.commentGateway.notifyUpdatedComment(response);
    return response;
  }

  // ---- Archiving ----

  /**
   * Archive a comment/conversation for a user
   */
  async archive(id: string, userId: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }
    // Only participants can archive
    const isParticipant = comment.authorId === userId || comment.recipientIds.includes(userId);
    if (!isParticipant) {
      throw new ForbiddenException('Only participants can archive this comment');
    }
    const updated = await this.commentRepository.archiveForUser(id, userId);
    if (!updated) {
      throw new CommentNotFoundException(id);
    }
    return this.mapToResponse(updated);
  }

  /**
   * Unarchive a comment/conversation for a user
   */
  async unarchive(id: string, userId: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }
    const updated = await this.commentRepository.unarchiveForUser(id, userId);
    if (!updated) {
      throw new CommentNotFoundException(id);
    }
    return this.mapToResponse(updated);
  }

  /**
   * Delete all attachments of a comment from Cloudinary
   */
  private async cleanupAttachments(comment: Comment): Promise<void> {
    for (const attachment of comment.attachments) {
      try {
        await this.cloudinaryService.deleteFile(attachment.publicId);
      } catch (error) {
        console.log('Error cleaning up attachment:', error.message);
      }
    }
  }


  /**
   * Get comments for a course grouped by type
   */
  async getCommentsByType(courseId: string): Promise<{
    course: CommentResponseDto[];
    chat: CommentResponseDto[];
  }> {
    const result = await this.commentRepository.findByCourseId(courseId, { limit: 100 });
    const allComments = result.data.map((c) => this.mapToResponse(c));
    return {
      course: allComments.filter((c) => c.type === CommentType.COURSE),
      chat: allComments.filter((c) => c.type === CommentType.CHAT),
    };
  }

  private mapPaginated(result: PaginatedResult<Comment>): PaginatedCommentResponseDto {
    return {
      data: result.data.map((c) => this.mapToResponse(c)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNext: result.hasNext,
      hasPrev: result.hasPrev,
    };
  }

  private mapToResponse(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      type: comment.type,
      content: comment.content,
      authorId: comment.authorId,
      courseId: comment.courseId,
      recipientIds: comment.recipientIds,
      parentId: comment.parentId,
      attachments: comment.attachments.map((a) => ({
        url: a.url,
        publicId: a.publicId,
        fileName: a.fileName,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
      reactions: comment.reactions.map((r) => ({
        userId: r.userId,
        emoji: r.emoji,
        createdAt: r.createdAt,
      })),
      reactionSummary: comment.reactionSummary,
      archivedBy: comment.archivedBy,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isDeleted: comment.isDeleted,
    };
  }
}
