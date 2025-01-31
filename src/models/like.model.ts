import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILike extends Document {
    videoId: Types.ObjectId;
    userId: Types.ObjectId;
    creatorId: Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
    {
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const Like = mongoose.model<ILike>("Like", likeSchema);
