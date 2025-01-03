import { Router } from "express";
import { findTopMatches, updateGenre , findSimilarityBetweenUsers } from "../controllers/genre.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router()


router.route('/update' ).post(authenticate , updateGenre)
router.route('/fetch-similar').post(authenticate , findTopMatches)
router.route('/similarity').post(authenticate , findSimilarityBetweenUsers)


export default router