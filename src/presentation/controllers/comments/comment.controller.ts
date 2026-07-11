import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommentService } from '../../../application/comment/comment.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponseDto,
  PaginatedCommentResponseDto,
  ReactionDto,
} from '../../dtos/comment.dto';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, type: CommentResponseDto, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateCommentDto): Promise<CommentResponseDto> {
    return this.commentService.create(dto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload an attachment file (returns attachment metadata)' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    return this.commentService.uploadAttachment(file);
  }

  @Get('search')
  @ApiOperation({ summary: 'Full-text search across comments the user is involved in' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PaginatedCommentResponseDto })
  async search(
    @Query('q') q: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Request() req,
  ): Promise<PaginatedCommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.search(q, userId, { page: Number(page), limit: Number(limit) });
  }

  @Get('archived')
  @ApiOperation({ summary: 'Get archived comments/conversations for the current user' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PaginatedCommentResponseDto })
  async findArchived(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Request() req,
  ): Promise<PaginatedCommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.findArchivedByUser(userId, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('course/:courseId/student/:studentId')
  @ApiOperation({ summary: 'Get all course comments for a specific student' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PaginatedCommentResponseDto })
  async findCourseCommentsByStudent(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PaginatedCommentResponseDto> {
    return this.commentService.findCourseCommentsByRecipient(courseId, studentId, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all comments for a course (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PaginatedCommentResponseDto })
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PaginatedCommentResponseDto> {
    return this.commentService.findByCourseId(courseId, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('author/:authorId')
  @ApiOperation({ summary: 'Get all comments by an author (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PaginatedCommentResponseDto })
  async findByAuthor(
    @Param('authorId') authorId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PaginatedCommentResponseDto> {
    return this.commentService.findByAuthorId(authorId, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('recipient/:recipientId')
  @ApiOperation({ summary: 'Get all comments sent to a recipient (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PaginatedCommentResponseDto })
  async findByRecipient(
    @Param('recipientId') recipientId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PaginatedCommentResponseDto> {
    return this.commentService.findByRecipientId(recipientId, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('replies/:parentId')
  @ApiOperation({ summary: 'Get all replies to a comment' })
  @ApiResponse({ status: 200, isArray: true, type: CommentResponseDto })
  async findReplies(@Param('parentId') parentId: string): Promise<CommentResponseDto[]> {
    return this.commentService.findReplies(parentId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PaginatedCommentResponseDto })
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PaginatedCommentResponseDto> {
    return this.commentService.findAll({ page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findById(@Param('id') id: string): Promise<CommentResponseDto> {
    return this.commentService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - only author can update' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @Request() req,
  ): Promise<CommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment (hard delete)' })
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - only author can delete' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user.userId;
    return this.commentService.delete(id, userId);
  }

  @Patch(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete a comment' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  async softDelete(@Param('id') id: string, @Request() req): Promise<CommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.softDelete(id, userId);
  }

  // ---- Reactions ----

  @Post(':id/reactions')
  @ApiOperation({ summary: 'Add/replace a reaction (emoji) on a comment' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  async addReaction(
    @Param('id') id: string,
    @Body() dto: ReactionDto,
    @Request() req,
  ): Promise<CommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.addReaction(id, userId, dto.emoji);
  }

  @Delete(':id/reactions')
  @ApiOperation({ summary: 'Remove your reaction from a comment' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  async removeReaction(@Param('id') id: string, @Request() req): Promise<CommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.removeReaction(id, userId);
  }

  // ---- Attachments ----

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload and attach a file to a comment' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async addAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<CommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.addAttachment(id, userId, file);
  }

  @Delete(':id/attachments/:publicId')
  @ApiOperation({ summary: 'Remove an attachment from a comment' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  async removeAttachment(
    @Param('id') id: string,
    @Param('publicId') publicId: string,
    @Request() req,
  ): Promise<CommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.removeAttachment(id, userId, decodeURIComponent(publicId));
  }

  // ---- Archiving ----

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a comment/conversation for the current user' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  async archive(@Param('id') id: string, @Request() req): Promise<CommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.archive(id, userId);
  }

  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a comment/conversation for the current user' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  async unarchive(@Param('id') id: string, @Request() req): Promise<CommentResponseDto> {
    const userId = req.user.userId;
    return this.commentService.unarchive(id, userId);
  }
}
