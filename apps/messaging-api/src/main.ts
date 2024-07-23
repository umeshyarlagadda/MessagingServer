import * as mongoose from 'mongoose';
import { Logger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { MessagingApiModule } from './messaging-api.module';
import { SocketService } from './services/socket/socket.service';
import { ConfigService } from '@app/config';
import cacheClient = require("./utils/data-cache/data-cache");

async function bootstrap() {
  const options: any = {
    autoIndex: false
  };
  await mongoose.connect(process.env.Mongo_URL, options);
  console.log("Connected to DB...");
  const app = await NestFactory.create(MessagingApiModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors();
  const configSrvc = app.get(ConfigService);
  await configSrvc.GetEntireConfigFromDB();
  // cacheClient.redisServerURL = process.env.REDIS_SERVER;
  // cacheClient.connectRedis();
  const socketSrvc = app.get(SocketService);
  socketSrvc.InitializeSocket();
  await app.listen(process.env.Messaging_PORT);
  console.log(`Messaging API Server started listening on port :${process.env.Messaging_PORT}`);
}
bootstrap();
