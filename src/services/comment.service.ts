import { CommentRepository } from '../repositories/comment.repository';
import { PostRepository } from '../repositories/post.repository';
import { Role } from '../config/roles';
import { logger } from '../utils/logger';

export class CommentService {
    private commentRepository: CommentRepository;
    private postRepository: PostRepository;

    constructor(commentRepository: CommentRepository, postRepository: PostRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    async createComment(payload: {
        content: string;
        authorId: string;
        postId: string;
    }) {
        const post = await this.postRepository.findById(payload.postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const comment = await this.commentRepository.create({
            content: payload.content,
            author: payload.authorId as any,
            post: payload.postId as any
        });

        logger.info(`Comment created: ${comment.id} by user ${payload.authorId} on post ${payload.postId}`);

        return {
            message: 'Comment created successfully',
            data: {
                id: comment.id,
                content: comment.content,
                author: comment.author,
                post: comment.post,
                createdAt: (comment as any).createdAt,
                updatedAt: (comment as any).updatedAt
            }
        };
    }

    async updateComment(payload: {
        commentId: string;
        userId: string;
        userRole: string;
        content: string;
    }) {
        const comment = await this.commentRepository.findById(payload.commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        // Check ownership or admin privileges
        const authorId = (comment.author as any)._id || comment.author;
        const isOwner = authorId.toString() === payload.userId;
        const isAdmin = payload.userRole === Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new Error('You do not have permission to edit this comment');
        }

        const updatedComment = await this.commentRepository.update(payload.commentId, {
            content: payload.content
        });

        if (!updatedComment) {
            throw new Error('Failed to update comment');
        }

        return {
            message: 'Comment updated successfully',
            data: {
                id: updatedComment.id,
                content: updatedComment.content,
                author: updatedComment.author,
                post: updatedComment.post,
                createdAt: (updatedComment as any).createdAt,
                updatedAt: (updatedComment as any).updatedAt
            }
        };
    }

    async deleteComment(payload: {
        commentId: string;
        userId: string;
        userRole: string;
    }) {
        const comment = await this.commentRepository.findById(payload.commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        // Check ownership or admin privileges
        const authorId = (comment.author as any)._id || comment.author;
        const isOwner = authorId.toString() === payload.userId;
        const isAdmin = payload.userRole === Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new Error('You do not have permission to delete this comment');
        }

        await this.commentRepository.softDelete(payload.commentId);

        logger.info(`Comment soft deleted: ${payload.commentId} by user ${payload.userId}`);

        return {
            message: 'Comment deleted successfully'
        };
    }

    async listPostComments(payload: {
        postId: string;
        page?: number;
        limit?: number;
    }) {
        const comments = await this.commentRepository.findByPost(payload.postId, {
            page: payload.page || 1,
            limit: payload.limit || 10
        });

        const total = await this.commentRepository.countByPost(payload.postId);

        return {
            message: 'Comments retrieved successfully',
            data: comments.map(comment => ({
                id: comment.id,
                content: comment.content,
                author: comment.author,
                post: comment.post,
                createdAt: (comment as any).createdAt,
                updatedAt: (comment as any).updatedAt
            })),
            pagination: {
                page: payload.page || 1,
                limit: payload.limit || 10,
                total,
                totalPages: Math.ceil(total / (payload.limit || 10))
            }
        };
    }
}
