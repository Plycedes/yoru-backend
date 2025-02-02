import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { registerUser } from "../controllers/user.controller";

const router: Router = Router();

router.post("/register", registerUser);

export default router;
