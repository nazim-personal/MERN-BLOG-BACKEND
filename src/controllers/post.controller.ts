import type { Request, Response } from 'express';
import type { PostService } from '../services/post.service';
import { PostStatus } from '../models/post.model';

export class PostController {
    private postService: PostService;

    constructor(postService: PostService) {
        this.postService = postService;
    }

    public createPost = async (req: Request, res: Response) => {
        try {
            const { title, content, status, tags } = req.body;
            const authorId = req.user?.id;

            if (!authorId) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            if (!title || !content) {
                return res.status(400).json({
                    message: 'Title and content are required',
                    success: false
                });
            }

            const result = await this.postService.createPost({
                title,
                content,
                authorId,
                status: status as PostStatus,
                tags
            });

            return res.status(201).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public updatePost = async (req: Request, res: Response) => {
        try {
            const { postId } = req.params;
            const { title, content, status, tags } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.postService.updatePost({
                postId,
                userId,
                userRole,
                title,
                content,
                status: status as PostStatus,
                tags
            });

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            const statusCode = error.message.includes('permission') ? 403 : 400;
            return res.status(statusCode).json({
                message: error.message,
                success: false
            });
        }
    };

    public deletePost = async (req: Request, res: Response) => {
        try {
            const { postId } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.postService.deletePost({
                postId,
                userId,
                userRole
            });

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            const statusCode = error.message.includes('permission') ? 403 : 400;
            return res.status(statusCode).json({
                message: error.message,
                success: false
            });
        }
    };

    public getPost = async (req: Request, res: Response) => {
        try {
            const { postId } = req.params;

            const result = await this.postService.getPost(postId);

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            return res.status(404).json({
                message: error.message,
                success: false
            });
        }
    };

    public restorePost = async (req: Request, res: Response) => {
        try {
            const { postId } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.postService.restorePost({
                postId,
                userId,
                userRole
            });

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            const statusCode = error.message.includes('permission') ? 403 : 400;
            return res.status(statusCode).json({
                message: error.message,
                success: false
            });
        }
    };

    public listPosts = async (req: Request, res: Response) => {
        try {
            const { page, limit, status, tags, includeDeleted } = req.query;

            const result = await this.postService.listPosts({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                status: status as PostStatus,
                tags: tags ? (tags as string).split(',') : undefined,
                includeDeleted: includeDeleted === 'true'
            });

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public listUserPosts = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const { page, limit, status } = req.query;

            const result = await this.postService.listUserPosts({
                userId,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                status: status as PostStatus
            });

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };
}
