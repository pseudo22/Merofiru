import { Router } from "express";
import { loginUser, logoutUser, registerUser, updateUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticate} from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    upload.single('profilePicture')
    ,registerUser)


router.route('/login').post(loginUser)

router.route('/logout').post(authenticate , logoutUser)

router.route('/update').post(authenticate , upload.single('profilePicture') , updateUser)



export default router
