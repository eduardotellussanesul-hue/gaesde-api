import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentRepository, CommentSchema } from '../../infrastructure/repositories/comment.repository.impl';
import { CommentService } from './comment.service';
import { CommentController } from '../../presentation/controllers/comments/comment.controller';
import { CommentGateway } from '../../presentation/gateways/comment.gateway';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    CloudinaryModule,
  ],
  providers: [
    CommentService,
    CommentGateway,
    {
      provide: 'ICommentRepository',
      useClass: CommentRepository,
    },
  ],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
