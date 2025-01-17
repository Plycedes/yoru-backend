import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { generateProfilePicture } from "../utils/pfpGenerator.js";

export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if ([email, username, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "No field can be empty");
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ApiError(409, "Username or Email already exists");
    }

    const pfp = await generateProfilePicture(username);

    const user = await User.create({
      username,
      email,
      password,
      avatar: pfp.url,
      avatarId: pfp.public_id,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Error while creating new user");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User created successfully"));
  } catch (error) {
    throw new ApiError(500, "Error occured while creating new user");
  }
});
