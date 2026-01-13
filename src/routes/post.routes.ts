import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPostSchema, updatePostSchema, postQuerySchema } from '../validation/post.validation';
import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { Permission } from '../config/roles';

export const createPostRoutes = (
    postController: PostController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository,
    activityLogger: (action: string, resource: string) => any
): Router => {
    const router = Router();

    // Public route - view single post
    router.get('/:postId', postController.getPost);

    // Public route - list all posts (can filter by status, tags)
    router.get('/',
        validate(postQuerySchema),
        postController.listPosts
    );

    // Protected routes - require authentication
    router.post('/',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.POSTS_CREATE),
        validate(createPostSchema),
        activityLogger('create', 'post'),
        postController.createPost
    );

    router.put('/:postId',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.POSTS_EDIT_OWN),
        validate(updatePostSchema),
        activityLogger('update', 'post'),
        postController.updatePost
    );

    router.delete('/:postId',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.POSTS_DELETE_OWN),
        activityLogger('delete', 'post'),
        postController.deletePost
    );

    // Admin only - restore post
    router.post('/:postId/restore',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.POSTS_MANAGE_ALL),
        activityLogger('restore', 'post'),
        postController.restorePost
    );

    // Get posts by specific user
    router.get('/user/:userId',
        postController.listUserPosts
    );

    return router;
};
