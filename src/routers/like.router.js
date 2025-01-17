import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createLike, videoLiked } from "../controllers/like.controller.js";

const router = Router();

router.route("/create-like").post(verifyJWT, createLike);
router.route("/already-liked").post(verifyJWT, videoLiked);

export default router;
