import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { follow } from "../controllers/follow.controller";

const router: Router = Router();

router.route("/follow").post(verifyJWT, follow);

export default router;
