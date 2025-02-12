import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { ParsedQs } from "qs";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User, IUser } from "../models/user.model";

dotenv.config();
export interface CustomRequest<T = any, U extends ParsedQs = ParsedQs> extends Request {
    user?: IUser;
    body: T;
    query: U;
}

export const verifyJWT = asyncHandler(
    async (req: CustomRequest, _: Response, next: NextFunction): Promise<void> => {
        try {
            const token =
                req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

            if (!token) {
                throw new ApiError(401, "Unauthorized request");
            }

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as {
                _id: string;
            };

            const user = await User.findById(decodedToken._id).select("-password -refreshToken");

            if (!user) {
                throw new ApiError(401, "Invalid Access Token");
            }

            req.user = user;
            next();
        } catch (error: any) {
            throw new ApiError(401, error?.message || "Invalid Access Token");
        }
    }
);
