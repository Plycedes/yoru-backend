import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";

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
