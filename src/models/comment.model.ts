import { Schema, model, Document, Types } from 'mongoose';

export interface Comment {
    content: string;
    author: Types.ObjectId;
    post: Types.ObjectId;
    parentId?: Types.ObjectId | null;
    deletedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const CommentSchema = new Schema({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    versionKey: false
});

// Virtual for isDeleted
CommentSchema.virtual('isDeleted').get(function() {
    return this.deletedAt !== null;
});

// Indexes for efficient querying
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ deletedAt: 1 });

export const CommentModel = model<Comment & Document>('Comment', CommentSchema);
