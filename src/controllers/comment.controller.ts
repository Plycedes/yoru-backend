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
    }
);
