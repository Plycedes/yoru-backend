import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { Like } from "../models/like.model.js";

export const createLike = asyncHandler(async (req, res) => {
  const { videoId, creatorId } = req.body;
  const userId = req.user?._id;

  if (!videoId || !creatorId) {
    throw new ApiError(400, "No field can be empty");
  }

  const alreadyLiked = await Like.findOne({
    $and: [{ videoId: videoId }, { userId: userId }],
  });

  if (alreadyLiked) {
    throw new ApiError(409, "Video already bookmarked");
  }

  const like = await Like.create({
    videoId,
    userId,
    creatorId,
  });

  const likeCreated = await Like.findById({ _id: like._id });

  if (!likeCreated) {
    throw new ApiError(500, "Error adding the bookmark");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likeCreated, "Bookmark created successfully"));
});

export const videoLiked = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  const userId = req.user?._id;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  const alreadyLiked = await Like.findOne({
    $and: [{ videoId: videoId }, { userId: userId }],
  });

  return res.status(200).json(new ApiResponse(200, alreadyLiked, "Successful"));
});
