import { Room } from "../models/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Participant } from "../models/participant.model.js"
import crypto from "crypto";

const generateRoomCode = () => crypto.randomBytes(4).toString("hex");

const updatingParticipantsInRoom = async(roomId) =>{
    try {
        const updatedRoom = await Room.findById(roomId).populate({
            path: "participants",
            select: "user",
            populate: {
                path: "user",
                select: "username avatar"
            }
        });

        return updatedRoom;

    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching room details.");
    }
};

const createRoom = asyncHandler(async (req, res) => {
    
    const {title} = req.body;

    if(!title || title.trim()===""){
        throw new ApiError(401, "Enter the Title of Room");
    }

    if(!req.user || !req.user._id){
        throw new ApiError(401, "Unauthorized: Please Login First");
    }

    const room = await Room.create({
        title,
        host: req.user._id,
        roomCode: generateRoomCode(),
        settings:{
            chatEnabled: true,
            voiceEnabled: true,
            allowScreenShare: true
        },
    });

    if(!room){
        throw new ApiError(500, "Unable to create room.");
    };

    const hostAsParticipant = await Participant.create({
        room: room._id,
        user: req.user._id,
        role: "host",
    });

    if(!hostAsParticipant){
        throw new ApiError(500, "Unable to add host as participant.");
    }

    room.participants.push(hostAsParticipant._id);
    await room.save();

    const updatedRoom = await updatingParticipantsInRoom(room._id);

    if(!updatedRoom){
        throw new ApiError(500, "Something went wrong while fetching room details.");
    }


    return res.status(200)
              .json(
                new ApiResponse(201, updatedRoom, "Room Created Successfully")
              )

});

const joinRoom = asyncHandler(async (req, res) => {
    const {roomCode} = req.body;

    if(!roomCode || roomCode.trim()===""){
        throw new ApiError(401, "Room Code is required to join a room");
    }

    const room = await Room.findOne({roomCode, isActive: true});

    if(!room){
        throw new ApiError(404, "Room is not found or Inactive");
    }

    const existingPaticipant = await Participant.findOne({
        room: room._id,
        user: req.user._id
    });

    const updatedRoomForExistingParticipants = await updatingParticipantsInRoom(room._id);

    if(existingPaticipant){
        return res.status(200)
                  .json(
                    new ApiResponse(200, updatedRoomForExistingParticipants, "Already Joined the Room")
                  );
    };

    const role = room.host.toString() === req.user._id.toString() ? "host" : "participant";

    const newParticipant = await Participant.create({
        room: room._id,
        user: req.user._id,
        role
    });

    if(!newParticipant){
        throw new ApiError(500, "Unable to add participant to the room");
    }

    room.participants.push(newParticipant._id);
    await room.save();

    const updatedRoomForNewParticipants = await updatingParticipantsInRoom(room._id);

    return res.status(200)
              .json(
                new ApiResponse(201, updatedRoomForNewParticipants, "Joined the Room Successfully")
              );

});

const leaveRoom = asyncHandler(async (req, res) => {
    const {roomCode} = req.params;

    if(!roomCode){
        throw new ApiError(401, "Room Code is required to leave a room");
    }

    const room = await Room.findOne({roomCode, isActive: true});

    if(!room){
        throw new ApiError(404, "Room is not found or Inactive");
    }

    const removeParticipant = await Participant.findOneAndDelete({
        room: room._id,
        user: req.user._id
    });

    if(!removeParticipant){
        throw new ApiError(404, "Participant not found in the room");
    }

    room.participants.pull(removeParticipant._id);
    await room.save();

    return res.status(200)
              .json(
                new ApiResponse(201, {}, "Left the Room Successfully")
              );
});

const endRoom = asyncHandler(async (req, res) => {
    const {roomCode} = req.params;

    if(!roomCode){
        throw new ApiError(401, "Room Code is required to end a room");
    }

    const room = await Room.findOne({roomCode, isActive: true});

    if(!room){
        throw new ApiError(404, "Room is not found or Inactive");
    }

    const isOriginalHost = room.host.toString() === req.user._id.toString();

    const participantWithHostRole = await Participant.findOne({
        room: room._id,
        user: req.user._id,
        role: "host"
    });

    if(!isOriginalHost && !participantWithHostRole){
        throw new ApiError(403, "Only host can end the room");
    }

    room.isActive = false;
    room.participants = [];
    await room.save();

    await Participant.deleteMany({room: room._id});

    return res
           .status(200)
           .json(new ApiResponse(201, {}, "Room Ended Successfully"))

});

const getRoomHistory = asyncHandler(async (req, res) => {
    const rooms = await Room.find({isActive: false, host: req.user._id})
                            .sort({createdAt: -1});

    if(!rooms){
        throw new ApiError(404, "No room history found");
    }
    
    return res
            .status(200)
            .json(new ApiResponse(200, rooms, "Room history fetched successfully"));
            
});

const deleteAllRoomsHistory = asyncHandler(async (req, res) => {
    const deleteRooms = await Room.deleteMany({isActive: false, host: req.user._id});

    if(!deleteRooms){
        throw new ApiError(500, "Unable to delete room history");
    }

    return res
           .status(200)
           .json(new ApiResponse(201, {}, "All room history deleted successfully"));
});

const updateRoomSettings = asyncHandler(async (req, res) => {
    const {roomCode} = req.params;
    const {chatEnabled, voiceEnabled, allowScreenShare, videoEnabled} = req.body;

    if(!roomCode){
        throw new ApiError(401, "Room Code is required to update room settings");
    }

    const room = await Room.findOne({roomCode, isActive: true});

    if(!room || !room.isActive){
        throw new ApiError(404, "Room is not found or Inactive");
    }

    const isOriginalHost = room.host.toString() === req.user._id.toString();
    
    const participantWithHostRole = await Participant.findOne({
        room: room._id,
        user: req.user._id,
        role: "host"
    });

    if(!isOriginalHost && !participantWithHostRole){
        throw new ApiError(403, "Only host can update room settings");
    }

    if(chatEnabled !== undefined) room.settings.chatEnabled = chatEnabled;
    if(voiceEnabled !== undefined) room.settings.voiceEnabled = voiceEnabled;
    if(allowScreenShare !== undefined) room.settings.allowScreenShare = allowScreenShare;
    if(videoEnabled !== undefined) room.settings.videoEnabled = videoEnabled;

    await room.save();

    return res
           .status(200)
           .json(new ApiResponse(201, room, "Room settings updated successfully"));
});

const updateParticipantAccess = asyncHandler(async (req, res) => {
    const {roomCode, participantId} = req.params;
    const {role} = req.body;

    if(!roomCode || !participantId){
        throw new ApiError(401, "Room Code and Participant ID are required to update participant access");
    }

    const room = await Room.findOne({roomCode, isActive: true});

    if(!room){
        throw new ApiError(404, "Room is not found or Inactive");
    }

    const participant = await Participant.findById(participantId);

    if(!participant){
        throw new ApiError(404, "Participant not found");
    }

    // const isParticipant = participant.user.toString() === req.user._id.toString();
    const isHost = room.host.toString() === req.user._id.toString();

    if(!isHost){ 
        throw new ApiError(403, "Only host can update participant role");
    }

    if(role !== undefined){
        if(!["host", "participant"].includes(role)){
            throw new ApiError(400, "Invalid role");
        }

        participant.role = role;
        await participant.save();
    }


    return res
           .status(200)
           .json(new ApiResponse(201, participant, "Participant access updated successfully"));
});



export {
    createRoom,
    joinRoom,
    leaveRoom,
    endRoom,
    getRoomHistory,
    deleteAllRoomsHistory,
    updateRoomSettings,
    updateParticipantAccess
}