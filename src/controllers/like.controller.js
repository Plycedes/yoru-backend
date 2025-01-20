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
    $and: [{ videoId }, { userId }],
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
    $and: [{ videoId }, { userId }],
  });

  return res.status(200).json(new ApiResponse(200, alreadyLiked, "Successful"));
});

export const deleteLike = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  const userId = req.user?._id;

  const result = await Like.deleteOne({
    $and: [{ videoId }, { userId }],
  });

  if (result.deletedCount > 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Removed bookmark successfully"));
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Bookmark already removed or was never created"
        )
      );
  }
});

export const getLikesCount = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const likes = await Like.find({ creatorId: userId });
  const likesCount = likes.length;

  return res
    .status(200)
    .json(new ApiResponse(200, { bookmarksCount: likesCount }, "Successfull"));
});
