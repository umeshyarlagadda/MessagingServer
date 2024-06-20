const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
    Name: { type: String },      // Room name
    Members: [
        {
            _id: false,
            UserId: { type: mongoose.Schema.ObjectId, ref: "User" },
            CrBy: { type: Boolean },                                            // This permission is set for user who created the room. This user is like superadmin
            Admin: { type: Boolean },                                           // Admin rights is set for user who can invite/remove members to room
            Write: { type: Boolean }                                            // This permission is set for user who can send message to group
        }
    ],
    CrDt: { type: Date, default: Date.now },
    Del: { type: Boolean }
});

const ChatRoom = mongoose.model("SAPPChatRoom", ChatRoomSchema, "SAPPChatRooms");
export { ChatRoom };
