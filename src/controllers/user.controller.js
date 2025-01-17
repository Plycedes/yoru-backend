import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { generateProfilePicture } from "../utils/pfpGenerator.js";

export const registerUser = asyncHandler(async (req, res) => {
  try {
    const pfp = await generateProfilePicture("abhay");
    return res.send({ profile: pfp });
  } catch (error) {
    throw new ApiError(
      501,
      "Error occured while uploading creating and uploading pfp"
    );
  }
});
