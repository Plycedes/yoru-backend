import jwt from "jsonwebtoken";
import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User, IUser } from "../models/user.model";
import { MulterRequest } from "../middlewares/multer.middleware";
import { generateProfilePicture } from "../utils/generateProfilePicture";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    res.send({ status: "OK" });
});
