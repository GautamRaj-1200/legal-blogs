import { Request, Response } from "express";
import { Post } from "../models/post.model.js";
import { IUser } from "../types/user.js";
import { errorHandler } from "../utils/errorHandler.js";
import { ResponseHandler } from "../utils/responseHandler.js";

const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, desc, coverImageURL, categories } = req.body;
        if (!title && !desc) {
            ResponseHandler.error(res, "Title and description must be provided", 400);
            return;
        }

        const user = req.user as IUser;
        if (!user || !user._id) {
            ResponseHandler.unauthorized(res, "User not authenticated");
            return;
        }

        const newPost = await Post.create({
            title,
            desc,
            coverImageURL,
            categories,
            author: user._id
        });

        ResponseHandler.success(res, "Post created successfully", newPost, 201);
    } catch (error) {
        errorHandler(res, error, "Couldn't create post!!!!");
    }
};

const fetchAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const existingPosts = await Post.find();
        if (existingPosts.length === 0) {
            ResponseHandler.notFound(res, "No posts found");
            return;
        }
        ResponseHandler.success(res, "Posts fetched successfully", existingPosts);
    } catch (error) {
        errorHandler(res, error, "Couldn't fetch posts!!!!");
    }
};

const fetchSinglePost = async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.params;
    try {
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            ResponseHandler.notFound(res, "Requested post not found");
            return;
        }
        ResponseHandler.success(res, "Post fetched successfully", existingPost);
    } catch (error) {
        errorHandler(res, error, "Couldn't fetch post!!!!");
    }
};

const deleteSinglePost = async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.params;
    try {
        const user = req.user as IUser;
        if (!user || !user._id) {
            ResponseHandler.unauthorized(res, "User not authenticated");
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            ResponseHandler.notFound(res, "Post not found");
            return;
        }

        if (user._id.toString() !== post.author.toString()) {
            ResponseHandler.forbidden(res, "You can delete only your posts");
            return;
        }

        const deletedPost = await Post.deleteOne({ _id: postId });
        if (deletedPost.deletedCount === 0) {
            ResponseHandler.notFound(res, "Post could not be deleted");
            return;
        }
        ResponseHandler.success(res, "The post has been deleted", deletedPost);
    } catch (error) {
        errorHandler(res, error, "Couldn't delete post!!!!");
    }
};

const deleteUserPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || !user._id) {
            ResponseHandler.unauthorized(res, "User not authenticated");
            return;
        }

        const posts = await Post.find({ author: user._id });
        if (posts.length === 0) {
            ResponseHandler.notFound(res, "Couldn't find posts for the specified user");
            return;
        }

        const deletedPosts = await Post.deleteMany({ author: user._id });
        ResponseHandler.success(res, "All posts deleted successfully", { deletedCount: deletedPosts.deletedCount });
    } catch (error) {
        errorHandler(res, error, "Couldn't delete posts!!!!");
    }
};

const updateSinglePost = async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.params;
    const { title, desc, coverImageURL, categories } = req.body;

    try {
        const user = req.user as IUser;
        if (!user || !user._id) {
            ResponseHandler.unauthorized(res, "User not authenticated");
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            ResponseHandler.notFound(res, "Post not found");
            return;
        }

        if (user._id.toString() !== post.author.toString()) {
            ResponseHandler.forbidden(res, "You can update only your posts");
            return;
        }

        // Update only if a new value is provided
        post.title = title ?? post.title; // Use nullish coalescing
        post.desc = desc ?? post.desc;
        post.coverImageURL = coverImageURL ?? post.coverImageURL;
        post.categories = categories ?? post.categories;

        const updatedPost = await post.save();

        ResponseHandler.success(res, "Post updated successfully", updatedPost);
    } catch (error) {
        errorHandler(res, error, "Couldn't update post!!!!");
    }
};

export { createPost, fetchAllPosts, fetchSinglePost, deleteSinglePost, updateSinglePost, deleteUserPosts };
