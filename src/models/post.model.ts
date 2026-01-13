import { Schema, model, Document, Types } from 'mongoose';

export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived'
}

export interface Post {
    title: string;
    content: string;
    author: Types.ObjectId;
    status: PostStatus;
    tags: string[];
    slug: string;
    deletedAt?: Date | null;
    created_at?: Date;
    updated_at?: Date;
}

const PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
        type: String,
        enum: Object.values(PostStatus),
        default: PostStatus.DRAFT,
        index: true
    },
    tags: { type: [String], default: [] },
    slug: { type: String, unique: true, sparse: true },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
});

// Virtual for isDeleted
PostSchema.virtual('isDeleted').get(function() {
    return this.deletedAt !== null;
});

// Indexes for efficient querying
PostSchema.index({ author: 1, status: 1 });
PostSchema.index({ author: 1, deletedAt: 1 });
PostSchema.index({ created_at: -1 });
PostSchema.index({ deletedAt: 1 });
PostSchema.index({ tags: 1 });

// Generate slug from title before saving
PostSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

export const PostModel = model<Post & Document>('Post', PostSchema);
