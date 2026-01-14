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
        parentId?: string;
    }) {
        const post = await this.postRepository.findById(payload.postId);
        if (!post) {
            throw new Error('Post not found');
        }

        if (payload.parentId) {
            const parentComment = await this.commentRepository.findById(payload.parentId);
            if (!parentComment) {
                throw new Error('Parent comment not found');
            }
            // Handle both populated and non-populated post field
            const parentPostId = (parentComment.post as any)._id
                ? (parentComment.post as any)._id.toString()
                : parentComment.post.toString();

            if (parentPostId !== payload.postId) {
                throw new Error('Parent comment must belong to the same post');
            }
        }

        const comment = await this.commentRepository.create({
            content: payload.content,
            author: payload.authorId as any,
            post: payload.postId as any,
            parentId: payload.parentId as any
        });

        logger.info(`Comment created: ${comment._id} by user ${payload.authorId} on post ${payload.postId}`);

        return {
            message: 'Comment created successfully',
            data: {
                id: comment._id,
                content: comment.content,
                author: comment.author,
                post: comment.post,
                parentId: comment.parentId,
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
                id: updatedComment._id,
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
        nested?: boolean;
    }) {
        // If nested is true, build a tree structure
        if (payload.nested) {
            // Fetch all comments for the post
            const allComments = await this.commentRepository.findAllByPost(payload.postId);

            // Build comment tree
            const commentTree = this.buildCommentTree(allComments);

            // Apply pagination to root comments only
            const page = payload.page || 1;
            const limit = payload.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedRootComments = commentTree.slice(startIndex, endIndex);

            const totalRootComments = commentTree.length;

            return {
                message: 'Comments retrieved successfully',
                data: paginatedRootComments,
                pagination: {
                    page,
                    limit,
                    total: totalRootComments,
                    totalPages: Math.ceil(totalRootComments / limit)
                }
            };
        }

        // Default behavior: fetch root comments only with pagination
        const comments = await this.commentRepository.findRootCommentsByPost(payload.postId, {
            page: payload.page || 1,
            limit: payload.limit || 10
        });

        const total = await this.commentRepository.countByPost(payload.postId);

        return {
            message: 'Comments retrieved successfully',
            data: await Promise.all(comments.map(async comment => {
                const replyCount = await this.commentRepository.countRepliesByParentId(comment._id);
                return {
                    id: comment._id,
                    content: comment.content,
                    author: comment.author,
                    post: comment.post,
                    parentId: comment.parentId,
                    replyCount,
                    createdAt: (comment as any).createdAt,
                    updatedAt: (comment as any).updatedAt
                };
            })),
            pagination: {
                page: payload.page || 1,
                limit: payload.limit || 10,
                total,
                totalPages: Math.ceil(total / (payload.limit || 10))
            }
        };
    }

    async getReplies(payload: {
        commentId: string;
        page?: number;
        limit?: number;
    }) {
        const parentComment = await this.commentRepository.findById(payload.commentId);
        if (!parentComment) {
            throw new Error('Comment not found');
        }

        const replies = await this.commentRepository.findRepliesByParentId(payload.commentId, {
            page: payload.page || 1,
            limit: payload.limit || 10
        });

        const total = await this.commentRepository.countRepliesByParentId(payload.commentId);

        return {
            message: 'Replies retrieved successfully',
            data: await Promise.all(replies.map(async reply => {
                const replyCount = await this.commentRepository.countRepliesByParentId(reply._id);
                return {
                    id: reply._id,
                    content: reply.content,
                    author: reply.author,
                    post: reply.post,
                    parentId: reply.parentId,
                    replyCount,
                    createdAt: (reply as any).createdAt,
                    updatedAt: (reply as any).updatedAt
                };
            })),
            pagination: {
                page: payload.page || 1,
                limit: payload.limit || 10,
                total,
                totalPages: Math.ceil(total / (payload.limit || 10))
            }
        };
    }

    private buildCommentTree(comments: any[]): any[] {
        // Create a map for quick lookup
        const commentMap = new Map();
        const rootComments: any[] = [];

        // First pass: create comment objects with replies array
        comments.forEach(comment => {
            const commentObj = {
                id: comment._id,
                content: comment.content,
                author: comment.author,
                post: comment.post,
                parentId: comment.parentId,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                replies: []
            };
            commentMap.set(comment._id, commentObj);
        });

        // Second pass: build the tree structure
        comments.forEach(comment => {
            const commentObj = commentMap.get(comment._id);
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId.toString());
                if (parent) {
                    parent.replies.push(commentObj);
                }
            } else {
                rootComments.push(commentObj);
            }
        });

        // Add replyCount to all comments
        const addReplyCount = (comment: any): any => {
            return {
                ...comment,
                replyCount: comment.replies.length,
                replies: comment.replies.map(addReplyCount)
            };
        };

        return rootComments.map(addReplyCount);
    }
}
