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
