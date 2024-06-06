import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticate} from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    upload.single('profilePicture')
    ,registerUser)


router.route('/login').post(loginUser)

router.route('/logout').post(authenticate , logoutUser)



export default router
