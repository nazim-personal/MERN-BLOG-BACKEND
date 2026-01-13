import { Router } from 'express';
import { AuthConfig } from './config/types';
import { createAuthRoutes } from './routes/auth.routes';
import { createPostRoutes } from './routes/post.routes';
import { createCommentRoutes } from './routes/comment.routes';
import { createAdminRoutes } from './routes/admin.routes';
import { AuthController } from './controllers/auth.controller';
import { PostController } from './controllers/post.controller';
import { CommentController } from './controllers/comment.controller';
import { AdminController } from './controllers/admin.controller';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { PostService } from './services/post.service';
import { CommentService } from './services/comment.service';
import { AdminService } from './services/admin.service';
import { ActivityLogService } from './services/activity-log.service';
import { UserRepository } from './repositories/user.repository';
import { SessionRepository } from './repositories/session.repository';
import { PostRepository } from './repositories/post.repository';
import { CommentRepository } from './repositories/comment.repository';
import { ActivityLogRepository } from './repositories/activity-log.repository';
import { createActivityLogger } from './middlewares/activity-logger.middleware';

export class AuthModule {
    private config: AuthConfig;
    public router: Router;

    constructor(config: AuthConfig) {
        this.config = config;
        this.router = Router();
        this.initialize();
    }
    private initialize() {
        const userRepository = new UserRepository();
        const sessionRepository = new SessionRepository();
        const postRepository = new PostRepository();
        const commentRepository = new CommentRepository();
        const activityLogRepository = new ActivityLogRepository();

        const sessionService = new SessionService(sessionRepository, this.config);
        const authService = new AuthService(this.config, userRepository, sessionService);
        const postService = new PostService(postRepository, userRepository);
        const commentService = new CommentService(commentRepository, postRepository);
        const adminService = new AdminService(userRepository, postRepository, commentRepository);
        const activityLogService = new ActivityLogService(activityLogRepository);

        const authController = new AuthController(authService);
        const postController = new PostController(postService);
        const commentController = new CommentController(commentService);
        const adminController = new AdminController(adminService);

        const activityLogger = createActivityLogger(activityLogService);

        // API Versioning - v1
        const v1Router = Router();
        v1Router.use('/auth', createAuthRoutes(authController, this.config.jwt.accessSecret, sessionRepository, userRepository, activityLogger));
        v1Router.use('/posts', createPostRoutes(postController, this.config.jwt.accessSecret, sessionRepository, userRepository, activityLogger));
        v1Router.use('/', createCommentRoutes(commentController, this.config.jwt.accessSecret, sessionRepository, userRepository, activityLogger));
        v1Router.use('/admin', createAdminRoutes(adminController, this.config.jwt.accessSecret, sessionRepository, userRepository));

        this.router.use('/v1', v1Router);
    }

    public static init(config: AuthConfig): AuthModule {
        return new AuthModule(config);
    }
}

export * from './config/types';
