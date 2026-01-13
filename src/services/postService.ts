import { Post } from '../models/Post';
import {
  IPost,
  PostQuery,
  PaginationOptions,
  PaginatedResult,
  CreatePostInput,
  UpdatePostInput,
} from '../types/IPost';
import { AppError } from '../types/IError';

export const createPost = async (
  input: CreatePostInput,
  userId: string
): Promise<IPost> => {
  const post = await Post.create({
    ...input,
    author: userId,
  });
  return post;
};

export const getPosts = async (
  query: PostQuery,
  options: PaginationOptions
): Promise<PaginatedResult<IPost>> => {
  const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;

  const filter = { ...query, isDeleted: false };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email'),
    Post.countDocuments(filter),
  ]);

  return {
    data: posts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

export const getPostBySlug = async (slug: string): Promise<IPost> => {
  const post = await Post.findOne({ slug, isDeleted: false }).populate(
    'author',
    'name email'
  );
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  return post;
};

export const updatePost = async (
  id: string,
  input: UpdatePostInput,
  userId: string,
  isAdmin: boolean
): Promise<IPost> => {
  const post = await Post.findOne({ _id: id, isDeleted: false });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.author.toString() !== userId && !isAdmin) {
    throw new AppError('Not authorized to update this post', 403);
  }

  Object.assign(post, input);
  await post.save();
  return post;
};

export const deletePost = async (
  id: string,
  userId: string,
  isAdmin: boolean
): Promise<void> => {
  const post = await Post.findOne({ _id: id, isDeleted: false });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.author.toString() !== userId && !isAdmin) {
    throw new AppError('Not authorized to delete this post', 403);
  }

  post.isDeleted = true;
  await post.save();
};
