import mongoose, { Schema } from 'mongoose';
import { IPost } from '../types/IPost';
import { generateSlug } from '../utils/slugGenerator';

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isDeleted: 1 });

// Auto-generate slug from title before saving
postSchema.pre('save', async function () {
  if (this.isModified('title') && !this.slug) {
    let slug = generateSlug(this.title);
    let counter = 1;

    // Check if slug exists and generate unique one
    while (await Post.findOne({ slug })) {
      slug = `${generateSlug(this.title)}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

// Update deletedAt when soft deleting
postSchema.pre('save', function () {
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.deletedAt = new Date();
  }
});

export const Post = mongoose.model<IPost>('Post', postSchema);
