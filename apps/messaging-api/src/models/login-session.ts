const mongoose = require("mongoose");

const LoginSessionSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.ObjectId, ref: "User" },        // User Id
    In: { type: Date },                                             // Login DateTime
    Out: { type: Date },                                            // Logout DateTime
    AccessToken: { type: String, trim: true },                      // Access Token(expiry nearly 15min)
});

const LoginSession = mongoose.model("LoginSession", LoginSessionSchema, "LoginSessions");
export { LoginSession };
