import mongoose, {Schema} from "mongoose";   

const inviteSchema = new Schema({

    room:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    inviter:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    inviteeEmail:{
        type: String,
        required: true,
        trim: true,
    },
    status:{
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending"
    },
    token:{
        type: String,
        required: true,
        unique: true,
    },

},{ timestamps: true });

export const Invite = mongoose.model("Invite", inviteSchema);