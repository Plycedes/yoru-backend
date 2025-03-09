import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import {
    createVideo,
    deleteVideo,
    getAllVideos,
    getUserVideos,
    getLikedVideos,
    searchVideos,
    getVideo,
} from "../controllers/video.controller";

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
router.get("/get-all-videos", verifyJWT, getAllVideos);
router.get("/get-user-videos", verifyJWT, getUserVideos);
router.get("/get-liked-videos", verifyJWT, getLikedVideos);
router.get("/search-videos", verifyJWT, searchVideos);
router.post("/get-video", verifyJWT, getVideo);

export default router;
