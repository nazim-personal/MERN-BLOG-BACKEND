import { UserRepository } from '../repositories/user.repository';
import { PostRepository } from '../repositories/post.repository';
import { CommentRepository } from '../repositories/comment.repository';
import { PostStatus } from '../models/post.model';
import { Role } from '../config/roles';

export class AdminService {
    private userRepository: UserRepository;
    private postRepository: PostRepository;
    private commentRepository: CommentRepository;

    constructor(
        userRepository: UserRepository,
        postRepository: PostRepository,
        commentRepository: CommentRepository
    ) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    async getDashboardStats() {
        // Parallelize queries for performance
        const [
            totalUsers,
            totalAdmins,
            totalPosts,
            publishedPosts,
            draftPosts,
            totalComments
        ] = await Promise.all([
            this.userRepository.countAll(),
            this.userRepository.countByRole(Role.ADMIN),
            this.postRepository.countAll(),
            this.postRepository.countAll(PostStatus.PUBLISHED),
            this.postRepository.countAll(PostStatus.DRAFT),
            this.commentRepository.countAll()
        ]);

        return {
            users: {
                total: totalUsers,
                admins: totalAdmins,
                regularUsers: totalUsers - totalAdmins
            },
            posts: {
                total: totalPosts,
                published: publishedPosts,
                draft: draftPosts
            },
            comments: {
                total: totalComments
            }
        };
    }
}
