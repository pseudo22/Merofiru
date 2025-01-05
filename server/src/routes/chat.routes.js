import { Router } from "express";
import { getMessages , fetchLastNotSeenMessage  } from "../controllers/chat.controller.js"; 
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router()



router.route('/:senderId/:receiverId').get(authenticate , getMessages)
router.route('/fetch-last-unseen-message').post(authenticate , fetchLastNotSeenMessage)

export default router
