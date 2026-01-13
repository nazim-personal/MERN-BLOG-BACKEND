import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { IComment, CreateCommentInput, UpdateCommentInput } from '../types/IComment';
import { AppError } from '../types/IError';

export const createComment = async (
  postId: string,
  input: CreateCommentInput,
  userId: string
): Promise<IComment> => {
  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comment = await Comment.create({
    ...input,
    post: postId,
    author: userId,
  });

  return await comment.populate('author', 'name email');
};

export const getCommentsByPost = async (postId: string): Promise<IComment[]> => {
  return await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate('author', 'name email');
};

export const updateComment = async (
  id: string,
  input: UpdateCommentInput,
  userId: string,
  isAdmin: boolean
): Promise<IComment> => {
  const comment = await Comment.findById(id);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (comment.author.toString() !== userId && !isAdmin) {
    throw new AppError('Not authorized to update this comment', 403);
  }

  Object.assign(comment, input);
  await comment.save();
  return comment;
};

export const deleteComment = async (
  id: string,
  userId: string,
  isAdmin: boolean
): Promise<void> => {
  const comment = await Comment.findById(id);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (comment.author.toString() !== userId && !isAdmin) {
    throw new AppError('Not authorized to delete this comment', 403);
  }

  await comment.deleteOne();
};
