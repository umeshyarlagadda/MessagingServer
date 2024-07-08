const mongoose = require("mongoose");

export const ConfigSchema = new mongoose.Schema({
    Name: { type: String },
    Config: mongoose.Schema.Types.Mixed
});

const Config = mongoose.model("Config", ConfigSchema, "Config");
export { Config };
