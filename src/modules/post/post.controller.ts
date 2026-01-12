import e, { NextFunction, Request, Response } from "express";
import { Postservice } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { error } from "node:console";
import { UserRole } from "../../middlewares/auth";

const createPost = async (req: Request, res: Response,next:NextFunction) => {
  try {
    // console.log(req.user);
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized access",
      });
    }
    const result = await Postservice.createPost(req.body, user.id as string);
    res.status(201).json(result);
  } catch (e) {
    next(e)
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    // console.log(search);
    const searchString = typeof search === "string" ? search : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
        ? false
        : undefined
      : undefined;
    // console.log({ isFeatured });
    const status = req.query.status as PostStatus | undefined;
    const authorId = req.query.authorId as string | undefined;

    // const page = Number(req.query.page ?? 1);
    // const limit = Number(req.query.limit ?? 10);

    // const skip = (page - 1) * limit;

    // const sortOrder = req.query.sortOrder as string | undefined;
    // const sortBy = req.query.sortBy as string | undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query
    );

    const result = await Postservice.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortOrder,
      sortBy,
    });
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: "post creation failed",
      details: e,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    console.log({ postId });
    if (!postId) {
      throw new Error("post id required...");
    }
    const result = await Postservice.getPostById(postId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: "post creation failed",
      details: err,
    });
  }
};
const getMyPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log(user);
    if (!user) {
      throw new Error("You are not authorized!");
    }
    const result = await Postservice.getMyPosts(user.id);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: "post fetched failed",
      details: err,
    });
  }
};

/**
 * user ---- sudhu nijer post update korte parbe. isFeatured update korte parbenaa,
 *
 * admin ----  sobar post update korte parbe...
 *
 *
 */

const updateMyPost = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const user = req.user;
    console.log(user);
    if (!user) {
      throw new Error("You are not authorized!");
    }
    const { postId } = req.params;
    const isAdmin = user.id === UserRole.ADMIN;
    const result = await Postservice.updateMyPost(
      postId as string,
      req.body,
      user.id,
      isAdmin
    );
    res.status(200).json(result);
  } catch (e) {
  next(e)
  }
};
const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log(user);
    if (!user) {
      throw new Error("You are not authorized!");
    }
    const { postId } = req.params;
    const isAdmin = user.id === UserRole.ADMIN;
    const result = await Postservice.deletePost(
      postId as string,
      user.id,
      isAdmin
    );
    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    const errorMessage =
      e instanceof Error ? e.message : "post delete failed !!!";
    res.status(400).json({
      error: errorMessage,
      details: e,
    });
  }
};
const getStats = async (req: Request, res: Response) => {
  try {
    const result = await Postservice.getStats();
    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    const errorMessage =
      e instanceof Error ? e.message : "Statistics fetched failed !!!";
    res.status(400).json({
      error: errorMessage,
      details: e,
    });
  }
};

export const PostController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updateMyPost,
  deletePost,
  getStats
};
