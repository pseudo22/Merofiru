import { Router } from "express";
import { findSimilarUsers, updateGenre } from "../controllers/genre.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router()


router.route('/update' ).post(authenticate , updateGenre)
router.route('/fetch-similar').post(authenticate , findSimilarUsers)


export default router