import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { Response } from "express";

import { Video } from "../models/video.model";
import { MulterRequest } from "../middlewares/multer.middleware";
import { CustomRequest } from "../middlewares/auth.middleware";

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { generateProfilePicture } from "../utils/generateProfilePicture";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
