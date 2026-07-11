export enum CommentType {
  COURSE = 'course',
  CHAT = 'chat',
}

export interface CommentAttachment {
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface CommentReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export class Comment {
  private _id: string;
  private _type: CommentType;
  private _content: string;
  private _authorId: string;
  private _courseId?: string;
  private _recipientIds: string[];
  private _parentId?: string;
  private _attachments: CommentAttachment[];
  private _reactions: CommentReaction[];
  private _archivedBy: string[];
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date;

  constructor(
    type: CommentType,
    content: string,
    authorId: string,
    recipientIds: string[],
    courseId?: string,
    parentId?: string,
    attachments: CommentAttachment[] = [],
  ) {
    this.validateContent(content, attachments);
    this.validateType(type);
    this.validateRecipients(recipientIds);

    this._type = type;
    this._content = content;
    this._authorId = authorId;
    this._recipientIds = recipientIds;
    this._courseId = courseId;
    this._parentId = parentId;
    this._attachments = attachments;
    this._reactions = [];
    this._archivedBy = [];
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._deletedAt = null;
  }

  private validateContent(content: string, attachments: CommentAttachment[] = []): void {
    const hasAttachments = attachments && attachments.length > 0;
    if ((!content || content.trim().length === 0) && !hasAttachments) {
      throw new Error('Comment content or attachment is required');
    }
    if (content && content.length > 5000) {
      throw new Error('Comment content must be at most 5000 characters');
    }
  }

  private validateType(type: CommentType): void {
    if (!Object.values(CommentType).includes(type)) {
      throw new Error('Invalid comment type');
    }
  }

  private validateRecipients(recipientIds: string[]): void {
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      throw new Error('At least one recipient is required');
    }
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get type(): CommentType {
    return this._type;
  }

  get content(): string {
    return this._content;
  }

  get authorId(): string {
    return this._authorId;
  }

  get courseId(): string | undefined {
    return this._courseId;
  }

  get recipientIds(): string[] {
    return this._recipientIds;
  }

  get parentId(): string | undefined {
    return this._parentId;
  }

  get attachments(): CommentAttachment[] {
    return this._attachments;
  }

  get reactions(): CommentReaction[] {
    return this._reactions;
  }

  get archivedBy(): string[] {
    return this._archivedBy;
  }

  get reactionSummary(): Record<string, number> {
    return this._reactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  // Setters
  set id(id: string) {
    this._id = id;
  }

  set content(content: string) {
    this.validateContent(content, this._attachments);
    this._content = content;
    this._updatedAt = new Date();
  }

  set recipientIds(recipientIds: string[]) {
    this.validateRecipients(recipientIds);
    this._recipientIds = recipientIds;
    this._updatedAt = new Date();
  }

  set attachments(attachments: CommentAttachment[]) {
    this._attachments = attachments;
    this._updatedAt = new Date();
  }

  set reactions(reactions: CommentReaction[]) {
    this._reactions = reactions;
  }

  set archivedBy(archivedBy: string[]) {
    this._archivedBy = archivedBy;
  }

  // Attachment operations
  addAttachment(attachment: CommentAttachment): void {
    this._attachments.push(attachment);
    this._updatedAt = new Date();
  }

  removeAttachment(publicId: string): void {
    this._attachments = this._attachments.filter((a) => a.publicId !== publicId);
    this._updatedAt = new Date();
  }

  // Reaction operations (one reaction per user)
  addReaction(userId: string, emoji: string): void {
    this._reactions = this._reactions.filter((r) => r.userId !== userId);
    this._reactions.push({ userId, emoji, createdAt: new Date() });
    this._updatedAt = new Date();
  }

  removeReaction(userId: string): void {
    this._reactions = this._reactions.filter((r) => r.userId !== userId);
    this._updatedAt = new Date();
  }

  hasReactionFrom(userId: string): boolean {
    return this._reactions.some((r) => r.userId === userId);
  }

  // Archive operations (per user)
  archiveFor(userId: string): void {
    if (!this._archivedBy.includes(userId)) {
      this._archivedBy.push(userId);
    }
  }

  unarchiveFor(userId: string): void {
    this._archivedBy = this._archivedBy.filter((id) => id !== userId);
  }

  isArchivedFor(userId: string): boolean {
    return this._archivedBy.includes(userId);
  }

  delete(): void {
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    this._deletedAt = null;
    this._updatedAt = new Date();
  }
}
