import { jest } from '@jest/globals';
import { AdminService } from '../../src/services/admin.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { PostRepository } from '../../src/repositories/post.repository';
import { CommentRepository } from '../../src/repositories/comment.repository';
import { Role } from '../../src/config/roles';
import { PostStatus } from '../../src/models/post.model';

// Mock dependencies
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/repositories/post.repository');
jest.mock('../../src/repositories/comment.repository');

describe('AdminService', () => {
    let adminService: AdminService;
    let userRepository: any;
    let postRepository: any;
    let commentRepository: any;

    beforeEach(() => {
        userRepository = new UserRepository() as any;
        postRepository = new PostRepository() as any;
        commentRepository = new CommentRepository() as any;

        userRepository.countAll = jest.fn() as any;
        userRepository.countByRole = jest.fn() as any;
        postRepository.countAll = jest.fn() as any;
        commentRepository.countAll = jest.fn() as any;

        adminService = new AdminService(userRepository, postRepository, commentRepository);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getDashboardStats', () => {
        it('should return correct dashboard statistics', async () => {
            userRepository.countAll.mockResolvedValue(10);
            userRepository.countByRole.mockResolvedValue(2);
            postRepository.countAll.mockImplementation((status?: PostStatus) => {
                if (status === PostStatus.PUBLISHED) return Promise.resolve(5);
                if (status === PostStatus.DRAFT) return Promise.resolve(3);
                return Promise.resolve(8);
            });
            commentRepository.countAll.mockResolvedValue(20);

            const stats = await adminService.getDashboardStats();

            expect(userRepository.countAll).toHaveBeenCalled();
            expect(userRepository.countByRole).toHaveBeenCalledWith(Role.ADMIN);
            expect(postRepository.countAll).toHaveBeenCalledTimes(3);
            expect(commentRepository.countAll).toHaveBeenCalled();

            expect(stats).toEqual({
                users: {
                    total: 10,
                    admins: 2,
                    regularUsers: 8
                },
                posts: {
                    total: 8,
                    published: 5,
                    draft: 3,
                    archived: 0
                },
                comments: {
                    total: 20
                }
            });
        });

        it('should handle errors from repositories', async () => {
            userRepository.countAll.mockRejectedValue(new Error('Database error'));

            await expect(adminService.getDashboardStats()).rejects.toThrow('Database error');
        });
    });
});
