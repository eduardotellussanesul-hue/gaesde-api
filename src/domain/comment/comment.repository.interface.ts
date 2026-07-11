import { Comment, CommentAttachment } from './comment.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface ICommentRepository {
  save(comment: Comment): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByCourseId(courseId: string, options?: PaginationOptions): Promise<PaginatedResult<Comment>>;
  findByAuthorId(authorId: string, options?: PaginationOptions): Promise<PaginatedResult<Comment>>;
  findByRecipientId(recipientId: string, options?: PaginationOptions): Promise<PaginatedResult<Comment>>;
  findCourseCommentsByRecipient(
    courseId: string,
    recipientId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Comment>>;
  findReplies(parentId: string): Promise<Comment[]>;
  findAll(options?: PaginationOptions): Promise<PaginatedResult<Comment>>;
  search(query: string, userId?: string, options?: PaginationOptions): Promise<PaginatedResult<Comment>>;
  findArchivedByUser(userId: string, options?: PaginationOptions): Promise<PaginatedResult<Comment>>;
  update(id: string, data: Partial<Comment>): Promise<Comment | null>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<Comment | null>;
  addReaction(id: string, userId: string, emoji: string): Promise<Comment | null>;
  removeReaction(id: string, userId: string): Promise<Comment | null>;
  addAttachment(id: string, attachment: CommentAttachment): Promise<Comment | null>;
  removeAttachment(id: string, publicId: string): Promise<Comment | null>;
  archiveForUser(id: string, userId: string): Promise<Comment | null>;
  unarchiveForUser(id: string, userId: string): Promise<Comment | null>;
}
