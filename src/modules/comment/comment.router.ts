import express, { Router } from "express";
import { commentController } from "./comment.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();
router.get("/author/:authorId",commentController.getCommentByAuthor)
router.get("/:commentId",commentController.getCommentById)

router.post("/",auth(UserRole.ADMIN,UserRole.USER), commentController.createComment);

router.delete(
    "/:commentId",
    auth(UserRole.ADMIN,UserRole.USER),
    commentController.deleteComment
)
router.patch(
    "/:commentId",
    auth(UserRole.ADMIN,UserRole.USER),
    commentController.updateComment
)

router.patch(
    "/:commentId/moderate",
    auth(UserRole.ADMIN),
    commentController.adminModerateComment
)

export const commentRouter: Router = router;
