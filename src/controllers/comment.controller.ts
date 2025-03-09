import { Request, Response } from "express";
import { Comment } from "../models/comment.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomRequest } from "../middlewares/auth.middleware";
import { CreateCommentBody, DeleteCommentBody } from "../types/requestTypes";

export const createComment = asyncHandler(
    async (req: CustomRequest<CreateCommentBody>, res: Response) => {
        const { comment, videoId } = req.body;

        if (!comment || !videoId) {
            throw new ApiError(409, "No field can be empty");
        }

        const createdComment = await Comment.create({
            comment,
            videoId,
            userId: req.user!._id,
        });

        if (!createComment) {
            throw new ApiError(501, "Something went wrong while creating the comment");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, createdComment, "Comment created successfully"));
    }
);

export const deleteComment = asyncHandler(
    async (req: CustomRequest<DeleteCommentBody>, res: Response) => {
        const { commentId } = req.body;
        const userId = req.user!._id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
        if (comment.userId != userId) {
            throw new ApiError(403, "Unauthorized");
        }

        const result = await Comment.deleteOne({ _id: commentId });

        if (result.deletedCount < 1) {
            throw new ApiError(502, "Error deleting the comment");
        }

        return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
    }
);
