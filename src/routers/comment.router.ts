import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createComment, deleteComment } from "../controllers/comment.controller";

const router = Router();

router.route("/create-comment").post(verifyJWT, createComment);
router.route("/delete-comment").post(verifyJWT, deleteComment);

export default router;
