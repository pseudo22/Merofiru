import { Router } from "express";
import { loginUser, logoutUser, registerUser, updateUser, sendFriendRequest , 
    confirmFriendRequest , rejectFriendRequest , removeFriend , blockUser, cancelFriendRequest,
    unblockUser

} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticate} from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    upload.single('profilePicture')
    ,registerUser)


router.route('/login').post(loginUser)

router.route('/logout').post(authenticate , logoutUser)

router.route('/update').post(authenticate , upload.single('profilePicture') , updateUser)

router.route('/send-friend-request').post(authenticate , sendFriendRequest)

router.route('/cancel-friend-request').post(authenticate , cancelFriendRequest)

router.route('/confirm-friend-request').post(authenticate , confirmFriendRequest)

router.route('/reject-friend-request').post(authenticate , rejectFriendRequest)

router.route('/remove-friend').post(authenticate , removeFriend)

router.route('/block-user').post(authenticate , blockUser)

router.route('/unblock-user').post(authenticate , unblockUser)



export default router
