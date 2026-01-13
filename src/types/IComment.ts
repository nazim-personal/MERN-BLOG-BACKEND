import { Document, Types } from 'mongoose';

import { z } from 'zod';
import { createCommentSchema, updateCommentSchema } from '../validators/commentValidator';

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>['body'];

