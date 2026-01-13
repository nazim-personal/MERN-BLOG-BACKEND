import { PostModel, Post, PostStatus } from '../models/post.model';
import { Document, Types } from 'mongoose';

export class PostRepository {
    async create(data: Partial<Post>): Promise<Post & Document> {
        return await PostModel.create(data);
    }

    async findById(postId: string): Promise<(Post & Document) | null> {
        return await PostModel.findOne({ _id: postId, deletedAt: null }).populate('author', 'name email');
    }

    async findByAuthor(
        authorId: string,
        options: { page?: number; limit?: number; status?: PostStatus; includeDeleted?: boolean }
    ): Promise<(Post & Document)[]> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const query: any = { author: authorId };
        if (options.status) {
            query.status = options.status;
        }
        if (!options.includeDeleted) {
            query.deletedAt = null;
        }

        return await PostModel
            .find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name email');
    }

    async findAll(options: {
        page?: number;
        limit?: number;
        status?: PostStatus;
        tags?: string[];
        includeDeleted?: boolean;
    }): Promise<(Post & Document)[]> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (options.status) {
            query.status = options.status;
        }
        if (options.tags && options.tags.length > 0) {
            query.tags = { $in: options.tags };
        }
        if (!options.includeDeleted) {
            query.deletedAt = null;
        }

        return await PostModel
            .find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name email');
    }

    async update(postId: string, data: Partial<Post>): Promise<(Post & Document) | null> {
        return await PostModel.findOneAndUpdate(
            { _id: postId, deletedAt: null },
            { $set: data },
            { new: true, runValidators: true }
        ).populate('author', 'name email');
    }

    async delete(postId: string): Promise<void> {
        await PostModel.findByIdAndDelete(postId);
    }

    async softDelete(postId: string): Promise<(Post & Document) | null> {
        return await PostModel.findByIdAndUpdate(
            postId,
            { $set: { deletedAt: new Date() } },
            { new: true }
        ).populate('author', 'name email');
    }

    async restore(postId: string): Promise<(Post & Document) | null> {
        return await PostModel.findByIdAndUpdate(
            postId,
            { $set: { deletedAt: null } },
            { new: true }
        ).populate('author', 'name email');
    }

    async findDeleted(options: {
        page?: number;
        limit?: number;
    }): Promise<(Post & Document)[]> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        return await PostModel
            .find({ deletedAt: { $ne: null } })
            .sort({ deletedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name email');
    }

    async updateStatus(postId: string, status: PostStatus): Promise<(Post & Document) | null> {
        return await PostModel.findOneAndUpdate(
            { _id: postId, deletedAt: null },
            { $set: { status } },
            { new: true }
        ).populate('author', 'name email');
    }

    async countByAuthor(authorId: string, status?: PostStatus, includeDeleted?: boolean): Promise<number> {
        const query: any = { author: authorId };
        if (status) {
            query.status = status;
        }
        if (!includeDeleted) {
            query.deletedAt = null;
        }
        return await PostModel.countDocuments(query);
    }

    async countAll(status?: PostStatus, tags?: string[], includeDeleted?: boolean): Promise<number> {
        const query: any = {};
        if (status) {
            query.status = status;
        }
        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }
        if (!includeDeleted) {
            query.deletedAt = null;
        }
        return await PostModel.countDocuments(query);
    }
}
