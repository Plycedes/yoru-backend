import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { Response } from "express";

import { Video } from "../models/video.model";
import { MulterRequest } from "../middlewares/multer.middleware";
import { CustomRequest } from "../middlewares/auth.middleware";

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { CreateVideoBody } from "../types/requestTypes";

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
