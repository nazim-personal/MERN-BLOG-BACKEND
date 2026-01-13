import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCommentSchema, updateCommentSchema } from '../validation/comment.validation';
import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { Permission } from '../config/roles';

export const createCommentRoutes = (
    commentController: CommentController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository,
    activityLogger: (action: string, resource: string) => any
): Router => {
    const router = Router();

    // Create comment on post
    router.post('/posts/:postId/comments',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.COMMENTS_CREATE),
        validate(createCommentSchema),
        activityLogger('create', 'comment'),
        commentController.createComment
    );

    // List comments for post
    router.get('/posts/:postId/comments',
        commentController.listPostComments
    );

    // Update comment
    router.put('/comments/:commentId',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.COMMENTS_EDIT_OWN),
        validate(updateCommentSchema),
        activityLogger('update', 'comment'),
        commentController.updateComment
    );

    // Delete comment
    router.delete('/comments/:commentId',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.COMMENTS_DELETE_OWN),
        activityLogger('delete', 'comment'),
        commentController.deleteComment
    );

    return router;
};
