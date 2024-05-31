import express from 'express';
import { add , del , get, up} from '../controllers/testUser.js';

const router = express.Router();

router.post('/users', add);
router.get('/get' , get)
router.delete('/remove' , del)
router.post('/update/:id', up)

export default router;
