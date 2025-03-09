import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IComment extends Document {
    comment: string;
    videoId: Types.ObjectId;
    userId: Types.ObjectId;
}

const commentSchema = new Schema(
    {
        comment: {
            type: String,
            required: true,
        },
        videoId: {
            type: Types.ObjectId,
            ref: "Video",
        },
        userId: {
            type: Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model<IComment>("Comment", commentSchema);
