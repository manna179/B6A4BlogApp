import { Request, Response } from "express";
import { commentService } from "./comment.service";
import { date, string } from "better-auth/*";
import { Status } from "../../../generated/prisma/enums";
import { error } from "node:console";

const createComment = async (req: Request, res: Response) => {
  try {
    // console.log(req.user);
    const user = req.user;

    req.body.authorId = user?.id;

    const result = await commentService.createComment(req.body);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({
      error: "comment creation failed",
      details: e,
    });
  }
};
const getCommentById = async (req: Request, res: Response) => {
  try {
    // console.log(req.user);
    const { commentId } = req.params;

    const result = await commentService.getCommentById(commentId as string);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: " comment fetch failed",
      details: e,
    });
  }
};
const getCommentByAuthor = async (req: Request, res: Response) => {
  try {
    // console.log(req.user);
    const { authorId } = req.params;

    const result = await commentService.getCommentByAuthor(authorId as string);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: " comment fetch failed",
      details: e,
    });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    // console.log(req.user);
    const user = req.user;
    const { commentId } = req.params;

    const result = await commentService.deleteComment(
      commentId as string,
      user?.id as string
    );
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: " comment delete failed",
      details: e,
    });
  }
};
const updateComment = async (req: Request, res: Response) => {
  try {
    // console.log(req.user);
    const user = req.user;
    const { commentId } = req.params;

    const result = await commentService.updateComment(
      commentId as string,
      req.body,
      user?.id as string
    );
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: " comment update failed",
      details: e,
    });
  }
};
const adminModerateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const result = await commentService.adminModerateComment(
      commentId as string,
      req.body
    );
    res.status(200).json(result);
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "Comment update failed";
    res.status(400).json({
      error: errorMessage,
      details: e,
    });
  }
};

export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  deleteComment,
  updateComment,
  adminModerateComment,
};
