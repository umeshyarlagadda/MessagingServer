const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
    Name: { type: String },         // Room name, its optional
    Public: { type: Boolean },      // If room is public then anyone can join the room
    Members: [
        {
            _id: false,
            UserId: { type: mongoose.Schema.ObjectId },
            Name: { type: String },                                             // User name
            CrBy: { type: Boolean },                                            // This permission is set for user who created the room. This user is like superadmin
            Admin: { type: Boolean },                                           // Admin rights is set for user who can invite/remove members to room
            Write: { type: Boolean }                                            // This permission is set for user who can send message to group
        }
    ],
    P1EId: { type: Number },                                                    // Participant 1 entity id
    P2EId: { type: Number },                                                    // Participant 2 entity id
    CrDt: { type: Date, default: Date.now },
    Del: { type: Boolean }
});

const ChatRoom = mongoose.model("ConnectX.Room", ChatRoomSchema, "ConnectX.Rooms");
export { ChatRoom };
