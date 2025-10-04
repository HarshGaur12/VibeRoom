import mongoose, {Schema} from "mongoose";   

const participantSchema = new Schema({

    room:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role:{
        type: String,
        enum: ["host", "participant"],
        default: "participant"
    },
    permission:{
        isMuted:{type: Boolean, default: false},
        isVideoOn:{type: Boolean, default: false},
        isScreenSharing:{type: Boolean, default: false}
    }, 
    joinedAt:{
        type: Date,
        default: Date.now
    },
});

export const Participant = mongoose.model("Participant", participantSchema);