import mongoose, { Types, Schema, Document } from "mongoose";

export interface IFollow extends Document {
    followed: Types.ObjectId;
    follower: Types.ObjectId;
}

const followSchema = new Schema<IFollow>(
    {
        followed: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        follower: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const Follow = mongoose.model<IFollow>("Follow", followSchema);
