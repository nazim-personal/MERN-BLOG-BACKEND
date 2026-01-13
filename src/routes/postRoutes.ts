import { Router } from 'express';
import * as postController from '../controllers/postController';
import { validate } from '../middleware/validateRequest';
import { createPostSchema, updatePostSchema, getPostsSchema } from '../validators/postValidator';
import { protect } from '../middleware/authMiddleware';
import { logActivity } from '../middleware/activityLogger';

const router = Router();

router.route('/')
  .get(validate(getPostsSchema), postController.getPosts)
  .post(
    protect,
    validate(createPostSchema),
    logActivity('CREATE_POST'),
    postController.createPost
  );

router.route('/:slug')
  .get(postController.getPostBySlug);

router.route('/:id')
  .put(
    protect,
    validate(updatePostSchema),
    logActivity('UPDATE_POST'),
    postController.updatePost
  )
  .delete(
    protect,
    logActivity('DELETE_POST'),
    postController.deletePost
  );

export default router;
