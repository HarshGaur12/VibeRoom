import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createRoom, endRoom, joinRoom, leaveRoom } from '../controllers/room.controller.js';

const router = Router();

router.route("/create").post(verifyJWT, createRoom);
router.route("/join/:roomCode").post(verifyJWT, joinRoom);
router.route("/:roomCode/leave").delete(verifyJWT, leaveRoom); 
router.route("/:roomCode/end").patch(verifyJWT, endRoom);

export default router;