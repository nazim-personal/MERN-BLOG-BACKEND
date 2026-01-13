import { Schema, model, Document, Types } from 'mongoose';

export interface Comment {
    content: string;
    author: Types.ObjectId;
    post: Types.ObjectId;
    deletedAt?: Date | null;
    created_at?: Date;
    updated_at?: Date;
}

const CommentSchema = new Schema({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
});

// Virtual for isDeleted
CommentSchema.virtual('isDeleted').get(function() {
    return this.deletedAt !== null;
});

// Indexes for efficient querying
CommentSchema.index({ post: 1, created_at: -1 });
CommentSchema.index({ author: 1, created_at: -1 });
CommentSchema.index({ deletedAt: 1 });

export const CommentModel = model<Comment & Document>('Comment', CommentSchema);
