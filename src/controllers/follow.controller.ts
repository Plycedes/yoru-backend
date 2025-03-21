import { Response } from "express";

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { CustomRequest } from "../middlewares/auth.middleware";

import { Follow } from "../models/follow.model";
import { FollowBody } from "../types/requestTypes";

export const follow = asyncHandler(async (req: CustomRequest<FollowBody>, res: Response) => {
    const { followed } = req.body;
    const follower = req.user?._id;

    if (!followed || !follower) {
        throw new ApiError(400, "No field can be empty");
    }

    const alreadyFollowed = await Follow.findOne({ followed, follower });
    if (alreadyFollowed) {
        throw new ApiError(409, "Already followed");
    }

    const follow = await Follow.create({ followed, follower });

    const followedUser = await Follow.findById(follow._id);

    if (!followedUser) {
        throw new ApiError(500, "Error following the user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, followedUser, "Followed the user successfully"));
});

export const unfollow = asyncHandler(async (req: CustomRequest<FollowBody>, res: Response) => {
    const { followed } = req.body;
    const follower = req.user?._id;

    if (!followed || !follower) {
        throw new ApiError(400, "No field can be empty");
    }

    const result = await Follow.deleteOne({ followed, follower });

    if (result.deletedCount > 0) {
        return res.status(200).json(new ApiResponse(200, {}, "Unfollowed the user successfully"));
    } else {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "User already unfollowed or was never followed"));
    }
});

export const followers = asyncHandler(async (req: CustomRequest, res: Response) => {
    const followed = req.user?._id;

    const followers = await Follow.find({ followed });

    return res
        .status(200)
        .json(new ApiResponse(200, followers.length, "Fetched the followers successfully"));
});

export const following = asyncHandler(async (req: CustomRequest, res: Response) => {
    const follower = req.user?._id;

    const following = await Follow.find({ follower });

    return res
        .status(200)
        .json(new ApiResponse(200, following.length, "Fetched the following successfully"));
});
