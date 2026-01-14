import type { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';

export class CommentController {
    private commentService: CommentService;

    constructor(commentService: CommentService) {
        this.commentService = commentService;
    }

    public createComment = async (req: Request, res: Response) => {
        try {
            const { content, parentId } = req.body;
            const { postId } = req.params;
            const authorId = req.user?.id;

            if (!authorId) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.commentService.createComment({
                content,
                authorId,
                postId,
                parentId
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

    public updateComment = async (req: Request, res: Response) => {
        try {
            const { commentId } = req.params;
            const { content } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.commentService.updateComment({
                commentId,
                userId,
                userRole,
                content
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

    public deleteComment = async (req: Request, res: Response) => {
        try {
            const { commentId } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.commentService.deleteComment({
                commentId,
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

    public listPostComments = async (req: Request, res: Response) => {
        try {
            const { postId } = req.params;
            const { page, limit, nested } = req.query;

            const result = await this.commentService.listPostComments({
                postId,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                nested: nested === 'true'
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

    public getReplies = async (req: Request, res: Response) => {
        try {
            const { commentId } = req.params;
            const { page, limit } = req.query;

            const result = await this.commentService.getReplies({
                commentId,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10
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
