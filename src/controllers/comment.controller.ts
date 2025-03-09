import { Request, Response } from "express";
import { Comment } from "../models/comment.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomRequest } from "../middlewares/auth.middleware";
import { CreateCommentBody } from "../types/requestTypes";

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

        res.status(200).json(new ApiResponse(200, createdComment, "Comment created successfully"));
    }
);
