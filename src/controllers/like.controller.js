import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { Like } from "../models/like.model.js";

export const createLike = asyncHandler(async (req, res) => {
  return res.send({ status: "OK" });
});
