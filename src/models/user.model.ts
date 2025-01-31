import mongoose, { Schema, Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JsonObject } from "../utils/jsonTypes";
import ms from "ms";
import dotenv from "dotenv";

dotenv.config();

export interface IUser extends Document {
    username: string;
    email: string;
    avatar: string;
    avatarId: string;
    password: string;
    refreshToken?: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        avatarId: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
    const payload: JsonObject = {
        _id: this._id.toString(),
        email: this.email,
        username: this.username,
    };

    const secret = process.env.ACCESS_TOKEN_SECRET as string;
    if (!secret) {
        throw new Error("Access token secret is not defined in environment variables");
    }

    const options: jwt.SignOptions = {
        expiresIn: "1d",
    };

    return jwt.sign(payload, secret, options);
};

userSchema.methods.generateRefreshToken = function (): string {
    const payload: JsonObject = {
        _id: this._id.toString(),
        email: this.email,
        username: this.username,
    };

    const secret = process.env.REFRESH_TOKEN_SECRET as string;
    if (!secret) {
        throw new Error("Refresh token secret is not defined in environment variables");
    }

    const options: jwt.SignOptions = {
        expiresIn: "10d",
    };

    return jwt.sign(payload, secret, options);
};

export const User = mongoose.model<IUser>("User", userSchema);
