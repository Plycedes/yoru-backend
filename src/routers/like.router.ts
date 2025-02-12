import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createLike, deleteLike, videoLiked, getLikesCount } from "../controllers/like.controller";

const router: Router = Router();

router.route("/create-like").post(verifyJWT, createLike);
router.route("/delete-like").post(verifyJWT, deleteLike);
router.route("/already-liked").post(verifyJWT, videoLiked);
router.route("/get-likes-count").get(verifyJWT, getLikesCount);

export default router;
