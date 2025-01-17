import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadVideo } from "../middlewares/multer.middleware.js";
import { createVideo } from "../controllers/video.controller.js";

const router = Router();

router
  .route("/create-video")
  .post(verifyJWT, uploadVideo.single("video"), createVideo);

export default router;
