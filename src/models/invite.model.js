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

},{ timestamps: true });

export const Invite = mongoose.model("Invite", inviteSchema);