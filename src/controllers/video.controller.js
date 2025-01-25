import mongoose from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  deleteVideoFromCloudinary,
} from "../utils/cloudinary.js";

import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

export const createVideo = asyncHandler(async (req, res) => {
  const { title, prompt } = req.body;

  if (!title || !prompt) {
    throw new ApiError(409, "Title and prompt cannot be empty");
  }

  const files = req.files; // Object with file arrays
  const videoFile = files.video ? files.video[0] : null; // Access video file
  const thumbnailFile = files.thumbnail ? files.thumbnail[0] : null; // Access thumbnail file

  if (!videoFile || !thumbnailFile) {
    throw new ApiError(409, "Both video and thumbnail are required");
  }

  const video = await uploadOnCloudinary(videoFile.path);
  if (!video.url) {
    throw new ApiError(400, "Error while uploading video");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailFile.path);
  if (!thumbnail.url) {
    throw new ApiError(400, "Error while uploading thumbnail");
  }

  const videoObject = await Video.create({
    title,
    prompt,
    thumbnail: thumbnail.url,
    thumbnailId: thumbnail.public_id,
    video: video.url,
    videoId: video.public_id,
    creator: req.user,
  });

  const videoCreated = await Video.findById(videoObject._id);

  if (!videoCreated) {
    throw new ApiError(500, "Error creating the video object");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoCreated, "Video created successfully"));
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { vidId } = req.body;
  const userId = req.user?._id;

  if (!vidId) {
    throw new ApiError(409, "Video Id is required to delete a video");
  }

  const video = await Video.findById(vidId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (!video.creator.equals(userId)) {
    console.error(video.creator, userId);
    throw new ApiError(403, "You do not have permission to delete this video");
  }

  await deleteFromCloudinary(video.thumbnailId);
  await deleteVideoFromCloudinary(video.videoId);

  await Like.deleteMany({ videoId: vidId });

  const result = await Video.deleteOne({ _id: vidId });

  if (result.deletedCount === 1) {
    console.log("Deleted successfully");
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video deleted successfully"));
  } else {
    throw new ApiError(500, "Error deleteing the video");
  }
});

export const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pipeline = [
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
        "creatorDetails._id": 1,
        "creatorDetails.username": 1,
        "creatorDetails.avatar": 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
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
          totalPages: Math.ceil(totalVideos / limit),
        },
      },
      "Fetched all videos successfully"
    )
  );
});

export const getUserVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  console.log(userId);

  const pipeline = [
    {
      $match: { creator: userId },
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
    {
      $sort: { createdAt: -1 },
    },
  ];

  const userVideos = await Video.aggregate(pipeline);

  return res
    .status(200)
    .json(
      new ApiResponse(200, userVideos, "Fetched user's videos successfully")
    );
});

export const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const pipeline = [
    {
      $match: {
        userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videoId",
        foreignField: "_id",
        as: "likedVideos",
      },
    },
    {
      $unwind: "$likedVideos",
    },
    {
      $lookup: {
        from: "users",
        localField: "likedVideos.creator",
        foreignField: "_id",
        as: "creatorDetails",
      },
    },
    {
      $unwind: "$creatorDetails",
    },
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
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ];

  const likedVideos = await Like.aggregate(pipeline);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedVideos,
        "Fetched all bookmarked videos successfully"
      )
    );
});

export const searchVideos = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    throw new ApiError(400, "Query parameter is required");
  }

  const pipeline = [
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
        "creatorDetails._id": 1,
        "creatorDetails.username": 1,
        "creatorDetails.avatar": 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (page - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
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
          totalPages: Math.ceil(totalVideos / limit),
        },
      },
      "Fetched searched videos successfully"
    )
  );
});
