import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { createVideo, deleteVideo } from "../controllers/video.controller";

const router: Router = Router();

router.post(
    "/create-video",
    verifyJWT,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "video", maxCount: 1 },
    ]),
    createVideo
);
router.post("/delete-video", verifyJWT, deleteVideo);

export default router;
