import { PostRepository } from '../repositories/post.repository';
import { UserRepository } from '../repositories/user.repository';
import { PostStatus } from '../models/post.model';
import { Role } from '../config/roles';
import { logger } from '../utils/logger';

export class PostService {
    private postRepository: PostRepository;
    private userRepository: UserRepository;

    constructor(postRepository: PostRepository, userRepository: UserRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    async createPost(payload: {
        title: string;
        content: string;
        authorId: string;
        status?: PostStatus;
        tags?: string[];
    }) {
        const author = await this.userRepository.findById(payload.authorId as any);
        if (!author) {
            throw new Error('Author not found');
        }

        const post = await this.postRepository.create({
            title: payload.title,
            content: payload.content,
            author: payload.authorId as any,
            status: payload.status || PostStatus.DRAFT,
            tags: payload.tags || []
        });

        logger.info(`Post created: ${post.id} by user ${payload.authorId}`);

        return {
            message: 'Post created successfully',
            data: {
                id: post.id,
                title: post.title,
                content: post.content,
                author: {
                    id: author.id,
                    name: author.name,
                    email: author.email
                },
                status: post.status,
                tags: post.tags,
                slug: post.slug,
                created_at: (post as any).created_at,
                updated_at: (post as any).updated_at
            }
        };
    }

    async updatePost(payload: {
        postId: string;
        userId: string;
        userRole: string;
        title?: string;
        content?: string;
        status?: PostStatus;
        tags?: string[];
    }) {
        const post = await this.postRepository.findById(payload.postId);
        if (!post) {
            throw new Error('Post not found');
        }

        // Check ownership or admin privileges
        const isOwner = post.author.toString() === payload.userId;
        const isAdmin = payload.userRole === Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new Error('You do not have permission to edit this post');
        }

        const updateData: any = {};
        if (payload.title !== undefined) updateData.title = payload.title;
        if (payload.content !== undefined) updateData.content = payload.content;
        if (payload.status !== undefined) updateData.status = payload.status;
        if (payload.tags !== undefined) updateData.tags = payload.tags;

        const updatedPost = await this.postRepository.update(payload.postId, updateData);

        if (!updatedPost) {
            throw new Error('Failed to update post');
        }

        logger.info(`Post updated: ${payload.postId} by user ${payload.userId}`);

        return {
            message: 'Post updated successfully',
            data: {
                id: updatedPost.id,
                title: updatedPost.title,
                content: updatedPost.content,
                author: (updatedPost as any).author,
                status: updatedPost.status,
                tags: updatedPost.tags,
                slug: updatedPost.slug,
                created_at: (updatedPost as any).created_at,
                updated_at: (updatedPost as any).updated_at
            }
        };
    }

    async deletePost(payload: {
        postId: string;
        userId: string;
        userRole: string;
    }) {
        const post = await this.postRepository.findById(payload.postId);
        if (!post) {
            throw new Error('Post not found');
        }

        // Check ownership or admin privileges
        const isOwner = post.author.toString() === payload.userId;
        const isAdmin = payload.userRole === Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new Error('You do not have permission to delete this post');
        }

        // Use soft delete
        await this.postRepository.softDelete(payload.postId);

        logger.info(`Post soft deleted: ${payload.postId} by user ${payload.userId}`);

        return {
            message: 'Post deleted successfully'
        };
    }

    async restorePost(payload: {
        postId: string;
        userId: string;
        userRole: string;
    }) {
        // Only admins can restore posts
        const isAdmin = payload.userRole === Role.ADMIN;
        if (!isAdmin) {
            throw new Error('You do not have permission to restore posts');
        }

        // We need to find the post even if it is deleted, so we might need a specific repo method or update findById
        // The current findById excludes deleted posts. Let's use a direct repo call or update findById to allow optional inclusion.
        // For now, let's assume we can use findDeleted or we need to fetch it specifically.
        // Actually, restore is usually by ID. The repo restore method just does findByIdAndUpdate.
        // But we should verify it exists first? Or just try to restore.

        const restoredPost = await this.postRepository.restore(payload.postId);

        if (!restoredPost) {
            throw new Error('Post not found or could not be restored');
        }

        logger.info(`Post restored: ${payload.postId} by user ${payload.userId}`);

        return {
            message: 'Post restored successfully',
            data: {
                id: restoredPost.id,
                title: restoredPost.title,
                status: restoredPost.status
            }
        };
    }

    async getPost(postId: string) {
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        return {
            message: 'Post retrieved successfully',
            data: {
                id: post.id,
                title: post.title,
                content: post.content,
                author: (post as any).author,
                status: post.status,
                tags: post.tags,
                slug: post.slug,
                created_at: (post as any).created_at,
                updated_at: (post as any).updated_at
            }
        };
    }

    async listPosts(payload: {
        page?: number;
        limit?: number;
        status?: PostStatus;
        tags?: string[];
        includeDeleted?: boolean;
    }) {
        const posts = await this.postRepository.findAll({
            page: payload.page || 1,
            limit: payload.limit || 10,
            status: payload.status,
            tags: payload.tags,
            includeDeleted: payload.includeDeleted
        });

        const total = await this.postRepository.countAll(payload.status, payload.tags, payload.includeDeleted);

        return {
            message: 'Posts retrieved successfully',
            data: posts.map(post => ({
                id: post.id,
                title: post.title,
                content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
                author: (post as any).author,
                status: post.status,
                tags: post.tags,
                slug: post.slug,
                created_at: (post as any).created_at,
                updated_at: (post as any).updated_at,
                deleted_at: post.deleted_at
            })),
            pagination: {
                page: payload.page || 1,
                limit: payload.limit || 10,
                total,
                totalPages: Math.ceil(total / (payload.limit || 10))
            }
        };
    }

    async listUserPosts(payload: {
        userId: string;
        page?: number;
        limit?: number;
        status?: PostStatus;
        includeDeleted?: boolean;
    }) {
        const user = await this.userRepository.findById(payload.userId as any);
        if (!user) {
            throw new Error('User not found');
        }

        const posts = await this.postRepository.findByAuthor(payload.userId, {
            page: payload.page || 1,
            limit: payload.limit || 10,
            status: payload.status,
            includeDeleted: payload.includeDeleted
        });

        const total = await this.postRepository.countByAuthor(payload.userId, payload.status, payload.includeDeleted);

        return {
            message: 'User posts retrieved successfully',
            data: posts.map(post => ({
                id: post.id,
                title: post.title,
                content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
                author: (post as any).author,
                status: post.status,
                tags: post.tags,
                slug: post.slug,
                created_at: (post as any).created_at,
                updated_at: (post as any).updated_at,
                deleted_at: post.deleted_at
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
