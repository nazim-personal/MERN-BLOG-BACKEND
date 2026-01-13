import { PostModel, Post, PostStatus } from '../models/post.model';
import { Document, Types } from 'mongoose';

export class PostRepository {
    async create(data: Partial<Post>): Promise<Post & Document> {
        return await PostModel.create(data);
    }

    async findById(postId: string): Promise<(Post & Document) | null> {
        return await PostModel.findOne({ _id: new Types.ObjectId(postId), deleted_at: null }).populate('author', 'name email');
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
            query.deleted_at = null;
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
            query.deleted_at = null;
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
            { _id: new Types.ObjectId(postId), deleted_at: null },
            { $set: data },
            { new: true, runValidators: true }
        ).populate('author', 'name email');
    }

    async delete(postId: string): Promise<void> {
        await PostModel.findByIdAndDelete(postId);
    }

    async softDelete(postId: string): Promise<(Post & Document) | null> {
        return await PostModel.findByIdAndUpdate(
            new Types.ObjectId(postId),
            { $set: { deleted_at: new Date() } },
            { new: true }
        ).populate('author', 'name email');
    }

    async restore(postId: string): Promise<(Post & Document) | null> {
        return await PostModel.findByIdAndUpdate(
            new Types.ObjectId(postId),
            { $set: { deleted_at: null } },
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
            .find({ deleted_at: { $ne: null } })
            .sort({ deleted_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name email');
    }

    async updateStatus(postId: string, status: PostStatus): Promise<(Post & Document) | null> {
        return await PostModel.findOneAndUpdate(
            { _id: new Types.ObjectId(postId), deleted_at: null },
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
            query.deleted_at = null;
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
            query.deleted_at = null;
        }
        return await PostModel.countDocuments(query);
    }
}
