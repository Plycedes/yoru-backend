import { Router } from "express";
import { createComment } from "../controllers/comment.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/comment").post(verifyJWT, createComment);

export default router;
