const dotenv = require("dotenv").config();
import * as mongoose from 'mongoose';
import { StartConnection } from './no-cache';
// import { StartConnection } from './redis-cache';

async function StartMongoConnection() {
    const options: any = {
        autoIndex: false
      };
      await mongoose.connect(process.env.Mongo_URL, options);
      console.log("Connected to DB...");
      StartConnection(process.env.REDIS_SERVER, process.env.Relay_Server_Port);
      console.log(`Relay Server started listening on port :${process.env.Relay_Server_Port}`);
}

StartMongoConnection();