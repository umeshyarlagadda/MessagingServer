const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
    Name: { type: String },      // Room name
    BrokerId: { type: mongoose.Schema.ObjectId, ref: "User" },
    ClientId: { type: mongoose.Schema.ObjectId, ref: "User" },
    CrBy: { type: mongoose.Schema.ObjectId, ref: "User" },
    CrDt: { type: Date, default: Date.now },
    Del: { type: Boolean }
});

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema, "ChatRooms");
export { ChatRoom };
