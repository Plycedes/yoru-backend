import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { createVideo } from "../controllers/video.controller";

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

export default router;
