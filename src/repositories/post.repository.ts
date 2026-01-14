import { PostModel, Post, PostStatus } from '../models/post.model';
import { Document, Types } from 'mongoose';
import { isValidObjectId, toObjectId } from '../utils/sanitization.util';

const MAX_LIMIT = 100;

export class PostRepository {
    async create(data: Partial<Post>): Promise<Post & Document> {
        return await PostModel.create(data);
    }

    async findById(postId: string): Promise<(Post & Document) | null> {
        if (!isValidObjectId(postId)) {
            return null;
        }
        return await PostModel.findOne({
            _id: toObjectId(postId),
            $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
        }).populate('author', 'name email');
    }

    async findByAuthor(
        authorId: string,
        options: { page?: number; limit?: number; status?: PostStatus; includeDeleted?: boolean }
    ): Promise<any[]> {
        if (!isValidObjectId(authorId)) {
            return [];
        }
        const page = options.page || 1;
        const limit = Math.min(options.limit || 10, MAX_LIMIT);
        const skip = (page - 1) * limit;

        const query: any = { author: toObjectId(authorId) };
        if (options.status) {
            query.status = options.status;
        }
        if (!options.includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }

        return await PostModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title content author status tags slug createdAt updatedAt deletedAt')
            .populate('author', 'name email')
            .lean();
    }

    async findAll(options: {
        page?: number;
        limit?: number;
        status?: PostStatus;
        tags?: string[];
        includeDeleted?: boolean;
    }): Promise<any[]> {
        const page = options.page || 1;
        const limit = Math.min(options.limit || 10, MAX_LIMIT);
        const skip = (page - 1) * limit;

        const query: any = {};
        if (options.status) {
            query.status = options.status;
        }
        if (options.tags && options.tags.length > 0) {
            query.tags = { $in: options.tags };
        }
        if (!options.includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }

        return await PostModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title content author status tags slug createdAt updatedAt deletedAt')
            .populate('author', 'name email')
            .lean();
    }

    async update(postId: string, data: Partial<Post>): Promise<(Post & Document) | null> {
        if (!isValidObjectId(postId)) {
            return null;
        }
        return await PostModel.findOneAndUpdate(
            {
                _id: toObjectId(postId),
                $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
            },
            { $set: data },
            { new: true, runValidators: true }
        ).populate('author', 'name email');
    }

    async delete(postId: string): Promise<void> {
        if (!isValidObjectId(postId)) {
            throw new Error('Invalid post ID');
        }
        await PostModel.findByIdAndDelete(toObjectId(postId));
    }

    async softDelete(postId: string): Promise<(Post & Document) | null> {
        if (!isValidObjectId(postId)) {
            return null;
        }
        return await PostModel.findByIdAndUpdate(
            toObjectId(postId),
            { $set: { deletedAt: new Date() } },
            { new: true }
        ).populate('author', 'name email');
    }

    async restore(postId: string): Promise<(Post & Document) | null> {
        if (!isValidObjectId(postId)) {
            return null;
        }
        return await PostModel.findByIdAndUpdate(
            toObjectId(postId),
            { $set: { deletedAt: null } },
            { new: true }
        ).populate('author', 'name email');
    }

    async findDeleted(options: {
        page?: number;
        limit?: number;
    }): Promise<any[]> {
        const page = options.page || 1;
        const limit = Math.min(options.limit || 10, MAX_LIMIT);
        const skip = (page - 1) * limit;

        return await PostModel
            .find({ deletedAt: { $ne: null } })
            .sort({ deletedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title status author deletedAt')
            .populate('author', 'name email')
            .lean();
    }

    async updateStatus(postId: string, status: PostStatus): Promise<(Post & Document) | null> {
        if (!isValidObjectId(postId)) {
            return null;
        }
        return await PostModel.findOneAndUpdate(
            {
                _id: toObjectId(postId),
                $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
            },
            { $set: { status } },
            { new: true }
        ).populate('author', 'name email');
    }

    async countByAuthor(authorId: string, status?: PostStatus, includeDeleted?: boolean): Promise<number> {
        if (!isValidObjectId(authorId)) {
            return 0;
        }
        const query: any = { author: toObjectId(authorId) };
        if (status) {
            query.status = status;
        }
        if (!includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
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
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }
        return await PostModel.countDocuments(query);
    }
}
