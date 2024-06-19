const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    Msg: { type: String },      // Msg Content
    RoomId: { type: mongoose.Schema.ObjectId, ref: "ChatRoom" },
    Sender: { type: mongoose.Schema.ObjectId, ref: "User" },
    Receiver: { type: mongoose.Schema.ObjectId, ref: "User" },
    CrDt: { type: Date, default: Date.now },
    ReadBy: [{ type: mongoose.Schema.ObjectId, ref: "User" }]
});

const Message = mongoose.model("SAPPMessage", MessageSchema, "SAPPMessages");
export { Message };
