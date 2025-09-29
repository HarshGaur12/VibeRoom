import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createRoom, joinRoom } from '../controllers/room.controller.js';

const router = Router();

router.route("/create").post(verifyJWT, createRoom);
router.route("/join/:roomCode").post(verifyJWT, joinRoom);  

export default router;