import { User } from '../models/User';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { IUser, UserRole } from '../types/IUser';
import { IPost } from '../types/IPost';
import { AppError } from '../types/IError';

export const getDashboardStats = async () => {
  const [totalUsers, totalPosts, totalComments] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments({ isDeleted: false }),
    Comment.countDocuments(),
  ]);

  return {
    totalUsers,
    totalPosts,
    totalComments,
  };
};

export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find().select('-password');
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Also delete user's posts and comments
  await Promise.all([
    Post.deleteMany({ author: userId }),
    Comment.deleteMany({ author: userId }),
  ]);
};

export const getAllPosts = async (): Promise<IPost[]> => {
  return await Post.find().populate('author', 'name email');
};

export const hardDeletePost = async (postId: string): Promise<void> => {
  const post = await Post.findByIdAndDelete(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Delete associated comments
  await Comment.deleteMany({ post: postId });
};
