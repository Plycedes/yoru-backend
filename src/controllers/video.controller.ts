import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { Response } from "express";

import { Video } from "../models/video.model";
import { Like } from "../models/like.model";
import { MulterRequest } from "../middlewares/multer.middleware";
import { CustomRequest } from "../middlewares/auth.middleware";

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
    deleteVideoFromCloudinary,
} from "../utils/cloudinary";
import { CreateVideoBody, VideoIdType } from "../types/requestTypes";

export const createVideo = asyncHandler(
    async (req: MulterRequest<CreateVideoBody>, res: Response) => {
        const { title, prompt } = req.body;

        if (!title || !prompt) {
            throw new ApiError(409, "Title and prompt cannot be empty");
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const videoFile = files?.video?.[0];
        const thumbnailFile = files?.thumbnail?.[0];

        if (!videoFile || !thumbnailFile) {
            throw new ApiError(409, "Both video and thumbnail are required");
        }

        const video = await uploadOnCloudinary(videoFile.path);
        if (!video) {
            throw new ApiError(400, "Error while uploading video");
        }

        const thumbnail = await uploadOnCloudinary(thumbnailFile.path);
        if (!thumbnail) {
            throw new ApiError(400, "Error while uploading thumbnail");
        }

        const videoObject = await Video.create({
            title,
            prompt,
            thumbnail: thumbnail.url,
            thumbnailId: thumbnail.public_id,
            video: video.url,
            videoId: video.public_id,
            creator: req.user?._id,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, videoObject, "Video created successfully"));
    }
);

export const deleteVideo = asyncHandler(
    async (req: CustomRequest<VideoIdType>, res: Response): Promise<Response> => {
        const { vidId } = req.body;
        const userId = (req.user?._id as Types.ObjectId).toString();

        if (!vidId) {
            throw new ApiError(409, "Video ID is required to delete a video");
        }

        const video = await Video.findById(vidId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        if (!video.creator.equals(userId)) {
            throw new ApiError(403, "You do not have permission to delete this video");
        }

        await deleteFromCloudinary(video.thumbnailId);
        await deleteVideoFromCloudinary(video.videoId);
        await Like.deleteMany({ videoId: vidId });

        const result = await Video.deleteOne({ _id: vidId });

        if (result.deletedCount !== 1) {
            throw new ApiError(500, "Error deleting the video");
        }

        return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
    }
);
