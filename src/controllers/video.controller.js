import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createVideo = asyncHandler(async (req, res) => {
  return res.send({ status: "OK" });
});
