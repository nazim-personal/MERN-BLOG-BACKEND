import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types/IComment';

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
