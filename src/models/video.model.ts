import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IVideo extends Document {
    video: string;
    videoId: string;
    thumbnail: string;
    thumbnailId: string;
    title: string;
    prompt: string;
    creator: Types.ObjectId;
}

const videoSchema = new Schema<IVideo>(
    {
        video: {
            type: String,
            required: true,
        },
        videoId: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        thumbnailId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        prompt: {
            type: String,
            required: true,
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model<IVideo>("Video", videoSchema);
