import { CommentModel, Comment } from '../models/comment.model';
import { Document } from 'mongoose';

export class CommentRepository {
    async create(data: Partial<Comment>): Promise<Comment & Document> {
        return await CommentModel.create(data);
    }

    async findById(commentId: string): Promise<(Comment & Document) | null> {
        return await CommentModel.findOne({ _id: commentId, deletedAt: null })
            .populate('author', 'name email')
            .populate('post', 'title slug');
    }

    async findByPost(
        postId: string,
        options: { page?: number; limit?: number; includeDeleted?: boolean }
    ): Promise<(Comment & Document)[]> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const query: any = { post: postId };
        if (!options.includeDeleted) {
            query.deletedAt = null;
        }

        return await CommentModel
            .find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name email');
    }

    async findByAuthor(
        authorId: string,
        options: { page?: number; limit?: number; includeDeleted?: boolean }
    ): Promise<(Comment & Document)[]> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const query: any = { author: authorId };
        if (!options.includeDeleted) {
            query.deletedAt = null;
        }

        return await CommentModel
            .find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('post', 'title slug');
    }

    async update(commentId: string, data: Partial<Comment>): Promise<(Comment & Document) | null> {
        return await CommentModel.findOneAndUpdate(
            { _id: commentId, deletedAt: null },
            { $set: data },
            { new: true, runValidators: true }
        ).populate('author', 'name email');
    }

    async softDelete(commentId: string): Promise<(Comment & Document) | null> {
        return await CommentModel.findByIdAndUpdate(
            commentId,
            { $set: { deletedAt: new Date() } },
            { new: true }
        );
    }

    async restore(commentId: string): Promise<(Comment & Document) | null> {
        return await CommentModel.findByIdAndUpdate(
            commentId,
            { $set: { deletedAt: null } },
            { new: true }
        );
    }

    async countByPost(postId: string, includeDeleted?: boolean): Promise<number> {
        const query: any = { post: postId };
        if (!includeDeleted) {
            query.deletedAt = null;
        }
        return await CommentModel.countDocuments(query);
    }

    async countAll(includeDeleted?: boolean): Promise<number> {
        const query: any = {};
        if (!includeDeleted) {
            query.deletedAt = null;
        }
        return await CommentModel.countDocuments(query);
    }
}
