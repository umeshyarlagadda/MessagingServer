const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    Msg: { type: String },      // Msg Content
    RoomId: { type: mongoose.Schema.ObjectId, ref: "ConnectX.Room" },
    Sender: { type: mongoose.Schema.ObjectId },
    Receiver: { type: mongoose.Schema.ObjectId },
    CrDt: { type: Date, default: Date.now },
    ReadBy: [{ type: mongoose.Schema.ObjectId }],
    Fav: [{ type: mongoose.Schema.ObjectId }],
});

const Message = mongoose.model("ConnectX.Message", MessageSchema, "ConnectX.Messages");
export { Message };
