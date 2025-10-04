import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createRoom, endRoom, getRoomHistory, joinRoom, leaveRoom, deleteAllRoomsHistory, updateRoomSettings, updateParticipantRole } from '../controllers/room.controller.js';

const router = Router();

router.route("/create").post(verifyJWT, createRoom);
router.route("/join/:roomCode").post(verifyJWT, joinRoom);
router.route("/:roomCode/leave").delete(verifyJWT, leaveRoom); 
router.route("/:roomCode/end").patch(verifyJWT, endRoom);
router.route("/history").get(verifyJWT, getRoomHistory);
router.route("/history/clear").delete(verifyJWT, deleteAllRoomsHistory);
router.route("/:roomCode/settings").patch(verifyJWT, updateRoomSettings); 
router.route("/:roomCode/participant/:participantId").patch(verifyJWT, updateParticipantRole);

export default router;