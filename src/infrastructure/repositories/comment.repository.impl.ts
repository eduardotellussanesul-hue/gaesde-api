import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import {
  Comment,
  CommentType,
  CommentAttachment,
  CommentReaction,
} from '../../domain/comment/comment.entity';
import {
  ICommentRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../domain/comment/comment.repository.interface';

export interface CommentDocument extends Document {
  type: string;
  content: string;
  author_id: string;
  course_id?: string;
  recipient_ids: string[];
  parent_id?: string;
  attachments: {
    url: string;
    public_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
  }[];
  reactions: {
    user_id: string;
    emoji: string;
    created_at: Date;
  }[];
  archived_by: string[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export const CommentSchema = new Schema<CommentDocument>(
  {
    type: {
      type: String,
      enum: ['course', 'chat'],
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: false,
      maxlength: 5000,
      default: '',
    },
    author_id: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    course_id: {
      type: String,
      required: false,
      ref: 'Course',
      index: true,
    },
    recipient_ids: {
      type: [String],
      required: true,
      default: [],
      ref: 'User',
    },
    parent_id: {
      type: String,
      required: false,
      ref: 'Comment',
      index: true,
    },
    attachments: {
      type: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true },
          file_name: { type: String, required: true },
          file_type: { type: String, required: true },
          file_size: { type: Number, required: true },
        },
      ],
      default: [],
    },
    reactions: {
      type: [
        {
          user_id: { type: String, required: true },
          emoji: { type: String, required: true },
          created_at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    archived_by: {
      type: [String],
      default: [],
    },
    deleted_at: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

// Indexes
CommentSchema.index({ course_id: 1, created_at: -1 });
CommentSchema.index({ author_id: 1, created_at: -1 });
CommentSchema.index({ recipient_ids: 1, created_at: -1 });
CommentSchema.index({ parent_id: 1 });
CommentSchema.index({ type: 1, created_at: -1 });
CommentSchema.index({ archived_by: 1 });
// Full-text search index on content
CommentSchema.index({ content: 'text' });

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(@InjectModel('Comment') private commentModel: Model<CommentDocument>) {}

  private getPagination(options?: PaginationOptions): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private buildPaginatedResult(
    data: Comment[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<Comment> {
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async save(comment: Comment): Promise<Comment> {
    const newComment = new this.commentModel({
      type: comment.type,
      content: comment.content,
      author_id: comment.authorId,
      course_id: comment.courseId,
      recipient_ids: comment.recipientIds,
      parent_id: comment.parentId,
      attachments: comment.attachments.map((a) => ({
        url: a.url,
        public_id: a.publicId,
        file_name: a.fileName,
        file_type: a.fileType,
        file_size: a.fileSize,
      })),
    });
    const saved = await newComment.save();
    comment.id = saved._id.toString();
    return comment;
  }

  async findById(id: string): Promise<Comment | null> {
    const found = await this.commentModel.findById(id).exec();
    if (!found || found.deleted_at) return null;
    return this.mapToEntity(found);
  }

  async findByCourseId(
    courseId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Comment>> {
    const { page, limit, skip } = this.getPagination(options);
    const filter = { course_id: courseId, deleted_at: null };
    const [found, total] = await Promise.all([
      this.commentModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);
    return this.buildPaginatedResult(
      found.map((f) => this.mapToEntity(f)),
      total,
      page,
      limit,
    );
  }

  async findByAuthorId(
    authorId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Comment>> {
    const { page, limit, skip } = this.getPagination(options);
    const filter = { author_id: authorId, deleted_at: null };
    const [found, total] = await Promise.all([
      this.commentModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);
    return this.buildPaginatedResult(
      found.map((f) => this.mapToEntity(f)),
      total,
      page,
      limit,
    );
  }

  async findByRecipientId(
    recipientId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Comment>> {
    const { page, limit, skip } = this.getPagination(options);
    const filter = { recipient_ids: recipientId, deleted_at: null };
    const [found, total] = await Promise.all([
      this.commentModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);
    return this.buildPaginatedResult(
      found.map((f) => this.mapToEntity(f)),
      total,
      page,
      limit,
    );
  }

  async findCourseCommentsByRecipient(
    courseId: string,
    recipientId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Comment>> {
    const { page, limit, skip } = this.getPagination(options);
    const filter = {
      course_id: courseId,
      recipient_ids: recipientId,
      type: 'course',
      deleted_at: null,
    };
    const [found, total] = await Promise.all([
      this.commentModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);
    return this.buildPaginatedResult(
      found.map((f) => this.mapToEntity(f)),
      total,
      page,
      limit,
    );
  }

  async findReplies(parentId: string): Promise<Comment[]> {
    const found = await this.commentModel
      .find({ parent_id: parentId, deleted_at: null })
      .sort({ created_at: 1 })
      .exec();
    return found.map((f) => this.mapToEntity(f));
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<Comment>> {
    const { page, limit, skip } = this.getPagination(options);
    const filter = { deleted_at: null };
    const [found, total] = await Promise.all([
      this.commentModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);
    return this.buildPaginatedResult(
      found.map((f) => this.mapToEntity(f)),
      total,
      page,
      limit,
    );
  }

  async search(
    query: string,
    userId?: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Comment>> {
    const { page, limit, skip } = this.getPagination(options);
    const filter: any = {
      $text: { $search: query },
      deleted_at: null,
    };
    // Restrict search to comments the user is involved in
    if (userId) {
      filter.$or = [{ author_id: userId }, { recipient_ids: userId }];
    }
    const [found, total] = await Promise.all([
      this.commentModel
        .find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);
    return this.buildPaginatedResult(
      found.map((f) => this.mapToEntity(f)),
      total,
      page,
      limit,
    );
  }

  async findArchivedByUser(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Comment>> {
    const { page, limit, skip } = this.getPagination(options);
    const filter = { archived_by: userId, deleted_at: null };
    const [found, total] = await Promise.all([
      this.commentModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);
    return this.buildPaginatedResult(
      found.map((f) => this.mapToEntity(f)),
      total,
      page,
      limit,
    );
  }

  async update(id: string, data: Partial<Comment>): Promise<Comment | null> {
    const updateData: any = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.recipientIds !== undefined) updateData.recipient_ids = data.recipientIds;

    const updated = await this.commentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated || updated.deleted_at) return null;
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.commentModel.findByIdAndDelete(id).exec();
  }

  async softDelete(id: string): Promise<Comment | null> {
    const updated = await this.commentModel
      .findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true })
      .exec();
    if (!updated) return null;
    return this.mapToEntity(updated);
  }

  async addReaction(id: string, userId: string, emoji: string): Promise<Comment | null> {
    // Remove existing reaction from this user, then push the new one
    await this.commentModel
      .findByIdAndUpdate(id, { $pull: { reactions: { user_id: userId } } })
      .exec();
    const updated = await this.commentModel
      .findByIdAndUpdate(
        id,
        { $push: { reactions: { user_id: userId, emoji, created_at: new Date() } } },
        { new: true },
      )
      .exec();
    if (!updated || updated.deleted_at) return null;
    return this.mapToEntity(updated);
  }

  async removeReaction(id: string, userId: string): Promise<Comment | null> {
    const updated = await this.commentModel
      .findByIdAndUpdate(id, { $pull: { reactions: { user_id: userId } } }, { new: true })
      .exec();
    if (!updated || updated.deleted_at) return null;
    return this.mapToEntity(updated);
  }

  async addAttachment(id: string, attachment: CommentAttachment): Promise<Comment | null> {
    const updated = await this.commentModel
      .findByIdAndUpdate(
        id,
        {
          $push: {
            attachments: {
              url: attachment.url,
              public_id: attachment.publicId,
              file_name: attachment.fileName,
              file_type: attachment.fileType,
              file_size: attachment.fileSize,
            },
          },
        },
        { new: true },
      )
      .exec();
    if (!updated || updated.deleted_at) return null;
    return this.mapToEntity(updated);
  }

  async removeAttachment(id: string, publicId: string): Promise<Comment | null> {
    const updated = await this.commentModel
      .findByIdAndUpdate(id, { $pull: { attachments: { public_id: publicId } } }, { new: true })
      .exec();
    if (!updated || updated.deleted_at) return null;
    return this.mapToEntity(updated);
  }

  async archiveForUser(id: string, userId: string): Promise<Comment | null> {
    const updated = await this.commentModel
      .findByIdAndUpdate(id, { $addToSet: { archived_by: userId } }, { new: true })
      .exec();
    if (!updated || updated.deleted_at) return null;
    return this.mapToEntity(updated);
  }

  async unarchiveForUser(id: string, userId: string): Promise<Comment | null> {
    const updated = await this.commentModel
      .findByIdAndUpdate(id, { $pull: { archived_by: userId } }, { new: true })
      .exec();
    if (!updated || updated.deleted_at) return null;
    return this.mapToEntity(updated);
  }

  private mapToEntity(doc: CommentDocument): Comment {
    const attachments: CommentAttachment[] = (doc.attachments || []).map((a) => ({
      url: a.url,
      publicId: a.public_id,
      fileName: a.file_name,
      fileType: a.file_type,
      fileSize: a.file_size,
    }));

    const comment = new Comment(
      doc.type as CommentType,
      doc.content || '',
      doc.author_id,
      doc.recipient_ids,
      doc.course_id,
      doc.parent_id,
      attachments,
    );
    comment.id = doc._id.toString();

    const reactions: CommentReaction[] = (doc.reactions || []).map((r) => ({
      userId: r.user_id,
      emoji: r.emoji,
      createdAt: r.created_at,
    }));
    comment.reactions = reactions;
    comment.archivedBy = doc.archived_by || [];

    if (doc.deleted_at) {
      comment.delete();
    }
    return comment;
  }
}
