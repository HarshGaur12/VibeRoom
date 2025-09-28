import mongoose, {Schema} from "mongoose";   

const streamSessionSchema = new Schema({
    
    room:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    streamType:{
        type: String,
        enum: ["video", "screen", "syncedVideo"],
        required: true
    },
    host:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive:{
        type: Boolean,
        default: true,
    },
    startedAt:{
        type: Date,
        default: Date.now
    },
    endedAt:{
        type: Date
    },
});

export const StreamSession = mongoose.model("StreamSession", streamSessionSchema);