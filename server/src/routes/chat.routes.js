import { Router } from "express";
import { getMessages } from "../controllers/chat.controller.js"; 
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router()



router.route('/:senderId/:receiverId').get(authenticate , getMessages)

export default router
