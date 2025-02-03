import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User, IUser } from "../models/user.model";
import { JsonObject } from "../utils/jsonTypes";
import { MulterRequest } from "../middlewares/multer.middleware";
import { CustomRequest } from "../middlewares/auth.middleware";
import { generateProfilePicture } from "../utils/generateProfilePicture";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { Types } from "mongoose";

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

const generateAccessAndRefreshTokens = async (userId: string): Promise<JsonObject> => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

export const loginUser = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = (await User.findOne({ $or: [{ username }, { email }] })) as IUser;

    if (!user) {
        throw new ApiError(404, "User not registered");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password");
    }

    const userId = (user._id as Types.ObjectId).toString();

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(userId);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

export const logoutUser = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<Response> => {
        if (!req.user) {
            return res.status(401).json(new ApiResponse(401, {}, "Unauthorized"));
        }
        await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

        const options = { httpOnly: true, secure: true };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out"));
    }
);

export const refreshAccessToken = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<Response> => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as { _id: string };

        const user = (await User.findById(decodedToken._id)) as IUser;

        if (!user || incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const userId = (user._id as Types.ObjectId).toString();

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(
            userId
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    }
);
