import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
    createComment,
    deleteComment,
    editComment,
    getComments,
} from "../controllers/comment.controller";

const router = Router();

router.route("/create-comment").post(verifyJWT, createComment);
router.route("/delete-comment").post(verifyJWT, deleteComment);
router.route("/edit-comment").post(verifyJWT, editComment);
router.route("/get-comments").post(verifyJWT, getComments);

export default router;
