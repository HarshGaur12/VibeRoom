import mongoose, {Schema} from "mongoose";

const roomSchema = new Schema({

    title:{
        type: String,
        required: [true, "Room title is required"],
        trim: true,
    },
    host:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    roomCode:{
        type: String,
        required: true,
        unique: true,
    },
    isActive:{
        type: Boolean,
        default: true,
    },
    settings:{
        chatEnabled:{type: Boolean, default: true},
        voiceEnabled:{type: Boolean, default: true},
        allowScreenShare:{type: Boolean, default: true}
    },
    participants:[
        {type: mongoose.Schema.Types.ObjectId,
         ref: "Participant",
        }
    ],

}, {timestamps: true});

export const Room = mongoose.model("Room", roomSchema);