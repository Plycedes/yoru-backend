import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { follow, unfollow, followers, following } from "../controllers/follow.controller";

const router: Router = Router();

router.route("/follow").post(verifyJWT, follow);
router.route("/unfollow").post(verifyJWT, unfollow);

router.route("/followers").get(verifyJWT, followers);
router.route("/following").get(verifyJWT, following);

export default router;
