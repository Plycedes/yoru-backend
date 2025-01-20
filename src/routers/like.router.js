import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createLike,
  videoLiked,
  deleteLike,
  getLikesCount,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/create-like").post(verifyJWT, createLike);
router.route("/already-liked").post(verifyJWT, videoLiked);
router.route("/delete-like").post(verifyJWT, deleteLike);
router.route("/get-likes-count").get(verifyJWT, getLikesCount);

export default router;
