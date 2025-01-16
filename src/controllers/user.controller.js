import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const registerUser = asyncHandler(async (req, res) => {
  const pfp = generateProfilePicture(
    "abhay",
    path.join(__dirname, `../../files/pfps/${"abhay.png"}`)
  );
  return res.send({ profile: "OK" });
});
