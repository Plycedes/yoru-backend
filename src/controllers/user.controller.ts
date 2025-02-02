import jwt from "jsonwebtoken";
import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User, IUser } from "../models/user.model";
import { MulterRequest } from "../middlewares/multer.middleware";
import { generateProfilePicture } from "../utils/generateProfilePicture";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { email, username, password } = req.body;

    if ([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "No field can be empty");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
        throw new ApiError(409, "Username or Email already exists");
    }

    const pfp = await generateProfilePicture(username);
    if (!pfp) {
        throw new ApiError(500, "Failed to generate profile picture");
    }

    const user = await User.create({
        username,
        email,
        password,
        avatar: pfp.url,
        avatarId: pfp.public_id,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Error while creating new user");
    }

    return res.status(200).json(new ApiResponse(200, createdUser, "User created successfully"));
});
