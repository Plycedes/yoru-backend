import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createVideo,
  deleteVideo,
  getAllVideos,
  getUserVideos,
  getLikedVideos,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/create-video").post(
  verifyJWT,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createVideo
);

router.route("/delete-video").post(verifyJWT, deleteVideo);
router.route("/get-all-videos").get(getAllVideos);
router.route("/get-user-videos").get(verifyJWT, getUserVideos);
router.route("/get-liked-videos").get(verifyJWT, getLikedVideos);

export default router;
