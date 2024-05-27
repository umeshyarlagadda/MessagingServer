const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    Msg: { type: String },      // Msg Content
    RoomId: { type: mongoose.Schema.ObjectId, ref: "ChatRoom" },
    Sender: { type: mongoose.Schema.ObjectId, ref: "User" },
    Receiver: { type: mongoose.Schema.ObjectId, ref: "User" },
    CrDt: { type: Date, default: Date.now },
    Read: { type: Boolean }
});

const Message = mongoose.model("Message", MessageSchema, "Messages");
export { Message };
