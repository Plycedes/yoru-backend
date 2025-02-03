import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller";

const router: Router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/logout", verifyJWT, logoutUser);
export default router;
