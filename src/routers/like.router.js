import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/create-like").post(verifyJWT, createLike);

export default router;
