import { ChatRoom } from '../../models/chat-room';
import { Message } from '../../models/message';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class MessageService {

    constructor(public logger: PinoLogger, public socketSrvc: SocketService) {
        this.logger.setContext(MessageService.name);
    }

    async CreateRoom(roomInfo: any, loginUserId: any) {
        try {
            roomInfo.CrBy = loginUserId;
            roomInfo = new ChatRoom(roomInfo);
            const savedRoom = await roomInfo.save();
            return savedRoom;
        } catch (error) {
            this.logger.error(`Error while CreateRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async DeleteRoom(roomId: any, loginUserId: any) {
        try {
            const updateRoomInfo = await ChatRoom.findOneAndUpdate({ _id: roomId, CrBy: loginUserId }, { $set: { Del: true } }, { new: true });
            return updateRoomInfo;
        } catch (error) {
            this.logger.error(`Error while DeleteRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async SendMessage(msgInfo: any) {
        try {
            msgInfo = new Message(msgInfo);
            const savedMsg = await msgInfo.save();
            this.socketSrvc.EmitUpdatedValues('NewChatRoomMessage', savedMsg);
            return savedMsg;
        } catch (error) {
            this.logger.error(`Error while SendMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async MarkMessagesAsRead(messageIds: any) {
        try {
            const updatedMsgInfo = await Message.updateMany({ _id: { $in: messageIds } }, { $set: { "Read": true } });
            return updatedMsgInfo;
        } catch (error) {
            this.logger.error(`Error while MarkMessagesAsRead ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetAllMessageRoomsOfBrokerAndClient(brokerId: any, clientId: any, loginUserId: any) {
        try {
            const roomsList = await ChatRoom.aggregate([
                { $match: { ClientId: clientId, BrokerId: brokerId, Del: { $ne: true } } },
                {
                    $lookup: {
                        from: "Messages",
                        localField: "_id",
                        foreignField: "RoomId",
                        as: "Messages",
                    },
                },
                {
                    $project: {
                        "_id": 1,
                        "Name": 1,
                        "BrokerId": 1,
                        "UserId": 1,
                        "CrBy": 1,
                        "CrDt": 1,
                        "Del": 1,
                        "UnReadMessagesList": {
                            "$filter": {
                                "input": "$Messages",
                                "as": "msgInfo",
                                "cond": {

                                    "$and": [
                                        { "$eq": ["$$msgInfo.Receiver", loginUserId] },
                                        { "$ne": ["$$msgInfo.Read", true] },
                                    ]
                                }
                            }
                        }
                    }
                }
            ]);
            return roomsList;
        } catch (error) {
            this.logger.error(`Error while GetAllMessageRoomsOfBrokerAndClient ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetMessagesOfRoom(roomId: any, pageNumber: any, resultsPerRequest: any) {
        try {
            const skipResults = (pageNumber == null || pageNumber == '') ? 0 : (Number(pageNumber) * resultsPerRequest);
            const messagesList = await Message.find({ RoomId: roomId }).sort({ _id: -1 }).skip(skipResults).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetMessagesOfRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }

}
