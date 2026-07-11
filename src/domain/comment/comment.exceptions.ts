export class CommentNotFoundException extends Error {
  constructor(commentId: string) {
    super(`Comment with id ${commentId} not found`);
    this.name = 'CommentNotFoundException';
  }
}

export class InvalidCommentTypeException extends Error {
  constructor(type: string) {
    super(`Invalid comment type: ${type}. Must be 'course' or 'chat'`);
    this.name = 'InvalidCommentTypeException';
  }
}

export class CommentNotAllowedException extends Error {
  constructor(reason: string) {
    super(`Comment operation not allowed: ${reason}`);
    this.name = 'CommentNotAllowedException';
  }
}
