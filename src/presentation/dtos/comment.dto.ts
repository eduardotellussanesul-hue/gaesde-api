import {
  IsEnum,
  IsString,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
  ArrayMinSize,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CommentType } from '../../domain/comment/comment.entity';

export class AttachmentDto {
  @ApiProperty({ description: 'Attachment URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Cloudinary public ID' })
  @IsString()
  publicId: string;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'MIME type' })
  @IsString()
  fileType: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsInt()
  @Min(0)
  fileSize: number;
}

export class CreateCommentDto {
  @ApiProperty({ description: 'Type of comment', enum: CommentType })
  @IsEnum(CommentType)
  type: CommentType;

  @ApiProperty({ description: 'Comment content', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @ApiProperty({ description: 'ID of the comment author (professor)' })
  @IsString()
  authorId: string;

  @ApiProperty({ description: 'IDs of students who will receive this comment', isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  recipientIds: string[];

  @ApiProperty({ description: 'Course ID (required for course comments)', required: false })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ description: 'Parent comment ID for replies', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: 'Attachments', required: false, isArray: true, type: AttachmentDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

export class UpdateCommentDto {
  @ApiProperty({ description: 'Updated comment content', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @ApiProperty({ description: 'Updated recipient IDs', required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  recipientIds?: string[];
}

export class ReactionDto {
  @ApiProperty({ description: 'Emoji reaction (e.g. 👍, ❤️, 😂)' })
  @IsString()
  @MaxLength(10)
  emoji: string;
}

export class PaginationQueryDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page (max 100)', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class SearchCommentDto {
  @ApiProperty({ description: 'Full-text search query' })
  @IsString()
  @MinLength(1)
  q: string;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page (max 100)', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: CommentType })
  type: CommentType;

  @ApiProperty()
  content: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty({ required: false })
  courseId?: string;

  @ApiProperty({ isArray: true })
  recipientIds: string[];

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty({ isArray: true, type: AttachmentDto })
  attachments: AttachmentDto[];

  @ApiProperty({ description: 'List of reactions', isArray: true })
  reactions: { userId: string; emoji: string; createdAt: Date }[];

  @ApiProperty({ description: 'Reaction counts grouped by emoji' })
  reactionSummary: Record<string, number>;

  @ApiProperty({ description: 'User IDs who archived this comment', isArray: true })
  archivedBy: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isDeleted: boolean;
}

export class PaginatedCommentResponseDto {
  @ApiProperty({ isArray: true, type: CommentResponseDto })
  data: CommentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  hasPrev: boolean;
}
