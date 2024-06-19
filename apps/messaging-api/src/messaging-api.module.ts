import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { LoggerModule } from 'nestjs-pino';
import { APP_FILTER } from '@nestjs/core';
import { MessageController } from './controllers/message/message.controller';
import { ExceptionHandler } from './utils/exception-handler/exception-handler';
import { MessageService } from './services/message/message.service';
import { SocketService } from './services/socket/socket.service';
import { UserAuthGuardService } from './services/user-auth-guard/user-auth-guard.service';
import { RoomController } from './controllers/room/room.controller';
import { RoomService } from './services/room/room.service';
const path = require("path");
const multistream = require('pino-multi-stream').multistream;

export const LoggerStreams = [
    { level: 'debug', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-debug.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'error', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-error.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'fatal', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-fatal.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'info', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-info.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'trace', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-trace.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
    { level: 'warn', stream: require('file-stream-rotator').getStream({ filename: path.join(__dirname + "/logs", "%DATE%-warn.stream.log"), date_format: "YYYY-MM-DD", frequency: "daily", max_logs: 7 }) },
];

@Module({
    imports: [ConfigModule.forRoot(),
    LoggerModule.forRoot({
        pinoHttp: [
            {
                level: 'trace',
                autoLogging: true,
                genReqId: function (req) { return uuidv4(); },
            }, multistream(LoggerStreams)
        ]
    })],
    controllers: [MessageController, RoomController],
    providers: [{
        provide: APP_FILTER,
        useClass: ExceptionHandler
    }, MessageService, SocketService, UserAuthGuardService, RoomService],
})
export class MessagingApiModule { }