import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
