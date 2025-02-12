import { Types, PipelineStage } from "mongoose";
import { Response } from "express";

import { Like } from "../models/like.model";
import { CustomRequest } from "../middlewares/auth.middleware";

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { LikesRequestBody } from "../types/requestTypes";

export const createLike = asyncHandler(
    async (req: CustomRequest<LikesRequestBody>, res: Response) => {
        const { videoId, creatorId } = req.body;
        const userId = req.user?._id;

        if (!videoId || !creatorId) {
            throw new ApiError(400, "No field can be empty");
        }

        const alreadyLiked = await Like.findOne({
            videoId,
            userId,
        });

        if (alreadyLiked) {
            throw new ApiError(409, "Video already bookmarked");
        }

        const like = await Like.create({
            videoId,
            userId,
            creatorId,
        });

        const likeCreated = await Like.findById(like._id);

        if (!likeCreated) {
            throw new ApiError(500, "Error adding the bookmark");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, likeCreated, "Bookmark created successfully"));
    }
);

export const videoLiked = asyncHandler(
    async (req: CustomRequest<LikesRequestBody>, res: Response) => {
        const { videoId } = req.body;
        const userId = req.user?._id;

        if (!videoId) {
            throw new ApiError(400, "VideoId is required");
        }

        const alreadyLiked = await Like.findOne({
            videoId,
            userId,
        });

        return res.status(200).json(new ApiResponse(200, alreadyLiked, "Successful"));
    }
);

export const deleteLike = asyncHandler(
    async (req: CustomRequest<LikesRequestBody>, res: Response) => {
        const { videoId } = req.body;
        const userId = req.user?._id;

        const result = await Like.deleteOne({
            videoId,
            userId,
        });

        if (result.deletedCount > 0) {
            return res.status(200).json(new ApiResponse(200, {}, "Removed bookmark successfully"));
        } else {
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "Bookmark already removed or was never created"));
        }
    }
);

export const getLikesCount = asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "User not authenticated");
    }

    const likes = await Like.find({ creatorId: userId });
    const likesCount = likes.length;

    return res.status(200).json(new ApiResponse(200, { bookmarksCount: likesCount }, "Successful"));
});
