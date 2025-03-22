import { Types, PipelineStage } from "mongoose";
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
import {
    CreateVideoBody,
    VideoIdType,
    PaginationType,
    VideoRequestBody,
} from "../types/requestTypes";

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
    async (req: CustomRequest<VideoIdType, {}>, res: Response): Promise<Response> => {
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

export const getAllVideos = asyncHandler(
    async (req: CustomRequest<{}, PaginationType>, res: Response) => {
        const { page = "1", limit = "5" } = req.query;

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: "users",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creatorDetails",
                },
            },
            {
                $unwind: {
                    path: "$creatorDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    prompt: 1,
                    thumbnail: 1,
                    video: 1,
                    createdAt: 1,
                    "creatorDetails._id": 1,
                    "creatorDetails.username": 1,
                    "creatorDetails.avatar": 1,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
        ];

        const videos = await Video.aggregate(pipeline);
        const totalVideos = await Video.countDocuments();

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    data: videos,
                    pagination: {
                        total: totalVideos,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(totalVideos / parseInt(limit)),
                    },
                },
                "Fetched all videos successfully"
            )
        );
    }
);

export const getUserVideos = asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const pipeline: PipelineStage[] = [
        { $match: { creator: userId } },
        {
            $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creatorDetails",
            },
        },
        {
            $unwind: {
                path: "$creatorDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                prompt: 1,
                thumbnail: 1,
                video: 1,
                createdAt: 1,
                "creatorDetails._id": 1,
                "creatorDetails.username": 1,
                "creatorDetails.avatar": 1,
            },
        },
        { $sort: { createdAt: -1 } },
    ];

    const userVideos = await Video.aggregate(pipeline);

    return res
        .status(200)
        .json(new ApiResponse(200, userVideos, "Fetched user's videos successfully"));
});

export const getLikedVideos = asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const pipeline: PipelineStage[] = [
        { $match: { userId } },
        {
            $lookup: {
                from: "videos",
                localField: "videoId",
                foreignField: "_id",
                as: "likedVideos",
            },
        },
        { $unwind: "$likedVideos" },
        {
            $lookup: {
                from: "users",
                localField: "likedVideos.creator",
                foreignField: "_id",
                as: "creatorDetails",
            },
        },
        { $unwind: "$creatorDetails" },
        {
            $project: {
                _id: "$likedVideos._id",
                title: "$likedVideos.title",
                thumbnail: "$likedVideos.thumbnail",
                video: "$likedVideos.video",
                prompt: "$likedVideos.prompt",
                "creatorDetails._id": 1,
                "creatorDetails.username": 1,
                "creatorDetails.avatar": 1,
                createdAt: 1,
            },
        },
        { $sort: { createdAt: -1 } },
    ];

    const likedVideos = await Like.aggregate(pipeline);

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Fetched all bookmarked videos successfully"));
});

export const searchVideos = asyncHandler(
    async (req: CustomRequest<{}, PaginationType>, res: Response) => {
        const { query, page = "1", limit = "10" } = req.query;

        if (!query) throw new ApiError(400, "Query parameter is required");

        const pipeline: PipelineStage[] = [
            {
                $match: {
                    title: { $regex: query, $options: "i" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creatorDetails",
                },
            },
            {
                $unwind: {
                    path: "$creatorDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    prompt: 1,
                    thumbnail: 1,
                    video: 1,
                    createdAt: 1,
                    "creatorDetails._id": 1,
                    "creatorDetails.username": 1,
                    "creatorDetails.avatar": 1,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
        ];

        const videos = await Video.aggregate(pipeline);
        const totalVideos = await Video.countDocuments({
            title: { $regex: query, $options: "i" },
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    data: videos,
                    pagination: {
                        total: totalVideos,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(totalVideos / parseInt(limit)),
                    },
                },
                "Fetched searched videos successfully"
            )
        );
    }
);

export const getVideo = asyncHandler(
    async (req: CustomRequest<VideoRequestBody>, res: Response) => {
        const { videoId } = req.body;
        const userId: string = req.user?._id as string;
        console.log("VideoId", videoId);

        const pipeline: PipelineStage[] = [
            { $match: { _id: new Types.ObjectId(videoId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creatorDetails",
                },
            },
            {
                $unwind: {
                    path: "$creatorDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "follows",
                    let: { creatorId: "$creatorDetails._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$followed", "$$creatorId"] },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                followersCount: { $sum: 1 },
                            },
                        },
                    ],
                    as: "followersData",
                },
            },
            {
                $lookup: {
                    from: "follows",
                    let: { creatorId: "$creatorDetails._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$followed", "$$creatorId"] },
                                        { $eq: ["$follower", new Types.ObjectId(userId)] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "isFollowingData",
                },
            },
            {
                $lookup: {
                    from: "likes",
                    let: { videoId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$videoId", "$$videoId"] },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                likesCount: { $sum: 1 },
                            },
                        },
                    ],
                    as: "likesData",
                },
            },
            {
                $addFields: {
                    followersCount: {
                        $ifNull: [{ $arrayElemAt: ["$followersData.followersCount", 0] }, 0],
                    },
                    isFollowing: { $gt: [{ $size: "$isFollowingData" }, 0] },
                    likesCount: {
                        $ifNull: [{ $arrayElemAt: ["$likesData.likesCount", 0] }, 0],
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    prompt: 1,
                    video: 1,
                    thumbnail: 1,
                    createdAt: 1,
                    "creatorDetails._id": 1,
                    "creatorDetails.username": 1,
                    "creatorDetails.avatar": 1,
                    followersCount: 1,
                    isFollowing: 1,
                    likesCount: 1,
                },
            },
        ];

        const video = await Video.aggregate(pipeline);
        return res.status(200).json(new ApiResponse(200, video, "Fetched video successfully"));
    }
);
