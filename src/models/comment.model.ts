import { Schema, model, Document, Types } from 'mongoose';

export interface Comment {
    content: string;
    author: Types.ObjectId;
    post: Types.ObjectId;
    deleted_at?: Date | null;
    created_at?: Date;
    updated_at?: Date;
}

const CommentSchema = new Schema({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    deleted_at: { type: Date, default: null }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
});

// Virtual for isDeleted
CommentSchema.virtual('isDeleted').get(function() {
    return this.deleted_at !== null;
});

// Indexes for efficient querying
CommentSchema.index({ post: 1, created_at: -1 });
CommentSchema.index({ author: 1, created_at: -1 });
CommentSchema.index({ deleted_at: 1 });

export const CommentModel = model<Comment & Document>('Comment', CommentSchema);
