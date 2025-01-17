import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createVideo = asyncHandler(async (req, res) => {
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

  return res.send({ video: video.url, thumbnail: thumbnail.url });
});
