import { CommentModel, Comment } from '../models/comment.model';
import { Document, Types } from 'mongoose';
import { isValidObjectId, toObjectId } from '../utils/sanitization.util';

const MAX_LIMIT = 100;

export class CommentRepository {
    async create(data: Partial<Comment>): Promise<Comment & Document> {
        return await CommentModel.create(data);
    }

    async findById(commentId: string): Promise<(Comment & Document) | null> {
        if (!isValidObjectId(commentId)) {
            return null;
        }
        return await CommentModel.findOne({
            _id: toObjectId(commentId),
            $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
        })
            .populate('author', 'name email')
            .populate('post', 'title slug');
    }

    async findByPost(
        postId: string,
        options: { page?: number; limit?: number; includeDeleted?: boolean }
    ): Promise<any[]> {
        if (!isValidObjectId(postId)) {
            return [];
        }
        const page = options.page || 1;
        const limit = Math.min(options.limit || 10, MAX_LIMIT);
        const skip = (page - 1) * limit;

        const query: any = { post: toObjectId(postId) };
        if (!options.includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }

        return await CommentModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('content author post parentId createdAt updatedAt deletedAt')
            .populate('author', 'name email')
            .lean();
    }

    async findByAuthor(
        authorId: string,
        options: { page?: number; limit?: number; includeDeleted?: boolean }
    ): Promise<any[]> {
        if (!isValidObjectId(authorId)) {
            return [];
        }
        const page = options.page || 1;
        const limit = Math.min(options.limit || 10, MAX_LIMIT);
        const skip = (page - 1) * limit;

        const query: any = { author: toObjectId(authorId) };
        if (!options.includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }

        return await CommentModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('content author post createdAt')
            .populate('post', 'title slug')
            .lean();
    }

    async update(commentId: string, data: Partial<Comment>): Promise<(Comment & Document) | null> {
        if (!isValidObjectId(commentId)) {
            return null;
        }
        return await CommentModel.findOneAndUpdate(
            {
                _id: toObjectId(commentId),
                $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
            },
            { $set: data },
            { new: true, runValidators: true }
        ).populate('author', 'name email');
    }

    async softDelete(commentId: string): Promise<(Comment & Document) | null> {
        if (!isValidObjectId(commentId)) {
            return null;
        }
        return await CommentModel.findByIdAndUpdate(
            toObjectId(commentId),
            { $set: { deletedAt: new Date() } },
            { new: true }
        );
    }

    async restore(commentId: string): Promise<(Comment & Document) | null> {
        if (!isValidObjectId(commentId)) {
            return null;
        }
        return await CommentModel.findByIdAndUpdate(
            toObjectId(commentId),
            { $set: { deletedAt: null } },
            { new: true }
        );
    }

    async countByPost(postId: string, includeDeleted?: boolean): Promise<number> {
        if (!isValidObjectId(postId)) {
            return 0;
        }
        const query: any = { post: toObjectId(postId) };
        if (!includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }
        return await CommentModel.countDocuments(query);
    }

    async countAll(includeDeleted?: boolean): Promise<number> {
        const query: any = {};
        if (!includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }
        return await CommentModel.countDocuments(query);
    }

    async findRootCommentsByPost(
        postId: string,
        options: { page?: number; limit?: number; includeDeleted?: boolean }
    ): Promise<any[]> {
        if (!isValidObjectId(postId)) {
            return [];
        }
        const page = options.page || 1;
        const limit = Math.min(options.limit || 10, MAX_LIMIT);
        const skip = (page - 1) * limit;

        const query: any = { post: toObjectId(postId), parentId: null };
        if (!options.includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }

        return await CommentModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('content author post parentId createdAt updatedAt')
            .populate('author', 'name email')
            .lean();
    }

    async findRepliesByParentId(
        parentId: string,
        options: { page?: number; limit?: number; includeDeleted?: boolean }
    ): Promise<any[]> {
        if (!isValidObjectId(parentId)) {
            return [];
        }
        const page = options.page || 1;
        const limit = Math.min(options.limit || 10, MAX_LIMIT);
        const skip = (page - 1) * limit;

        const query: any = { parentId: toObjectId(parentId) };
        if (!options.includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }

        return await CommentModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('content author parentId createdAt updatedAt')
            .populate('author', 'name email')
            .lean();
    }

    async countRepliesByParentId(parentId: string, includeDeleted?: boolean): Promise<number> {
        if (!isValidObjectId(parentId)) {
            return 0;
        }
        const query: any = { parentId: toObjectId(parentId) };
        if (!includeDeleted) {
            query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
        }
        return await CommentModel.countDocuments(query);
    }

    async findAllByPost(postId: string, includeDeleted?: boolean): Promise<any[]> {
        if (!isValidObjectId(postId)) {
            return [];
        }
        const query: any = { post: toObjectId(postId) };
        if (!includeDeleted) {
            query.deletedAt = null;
        }

        return await CommentModel
            .find(query)
            .sort({ createdAt: -1 })
            .select('content author post parentId createdAt updatedAt')
            .populate('author', 'name email')
            .lean();
    }
}
