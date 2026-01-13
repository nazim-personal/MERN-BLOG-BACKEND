import { Router } from 'express';
import * as commentController from '../controllers/commentController';
import { validate } from '../middleware/validateRequest';
import { createCommentSchema, updateCommentSchema } from '../validators/commentValidator';
import { protect } from '../middleware/authMiddleware';
import { logActivity } from '../middleware/activityLogger';

const router = Router({ mergeParams: true }); // Enable access to params from parent router

router.route('/')
  .get(commentController.getCommentsByPost)
  .post(
    protect,
    validate(createCommentSchema),
    logActivity('CREATE_COMMENT'),
    commentController.createComment
  );

// These routes need to be mounted separately or handled carefully
// Typically /api/v1/comments/:id would be better for update/delete
// But if nested under posts, we need to handle routing carefully
// For now, let's assume these are mounted at /api/v1/comments
const commentDetailRouter = Router();

commentDetailRouter.route('/:id')
  .put(
    protect,
    validate(updateCommentSchema),
    logActivity('UPDATE_COMMENT'),
    commentController.updateComment
  )
  .delete(
    protect,
    logActivity('DELETE_COMMENT'),
    commentController.deleteComment
  );

export { router as postCommentsRouter, commentDetailRouter };
