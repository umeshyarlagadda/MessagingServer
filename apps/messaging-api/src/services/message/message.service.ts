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

    async MarkMessagesAsRead(messageIds: any, loginUserId: any) {
        try {
            const updatedMsgInfo = await Message.updateMany({ _id: { $in: messageIds } }, { $addToSet: { "ReadBy": loginUserId } });
            return updatedMsgInfo;
        } catch (error) {
            this.logger.error(`Error while MarkMessagesAsRead ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async SendPrivateMessage(msgInfo: any) {
        try {
            msgInfo = new Message(msgInfo);
            const savedMsg = await msgInfo.save();
            this.socketSrvc.EmitValueToSocket('NewPrivateMessage', savedMsg);
            return savedMsg;
        } catch (error) {
            this.logger.error(`Error while SendPrivateMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async SendRoomMessage(msgInfo: any) {
        try {
            msgInfo = new Message(msgInfo);
            const savedMsg = await msgInfo.save();
            this.socketSrvc.EmitValueToSocket('NewChatRoomMessage', savedMsg);
            return savedMsg;
        } catch (error) {
            this.logger.error(`Error while SendRoomMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetPrivateMessagesBetweenUsers(loginUserId: any, participantUserId: any, pageNumber: any, resultsPerRequest: any) {
        try {
            const skipResults = (pageNumber == null || pageNumber == '') ? 0 : (Number(pageNumber) * resultsPerRequest);
            const messagesList = await Message.find({
                $or: [
                    { Sender: loginUserId, Receiver: participantUserId },
                    { Sender: participantUserId, Receiver: loginUserId }
                ]
            }).sort({ _id: -1 }).skip(skipResults).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetMessagesOfRoom ${JSON.stringify(error)}`);
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

    async GetUnreadPvtMsgDetails(loginUserId: any) {
        try {
            const messagesList = await Message.aggregate([
                {
                    $match: {
                        Receiver: loginUserId,
                        ReadBy: { $ne: loginUserId }
                    }
                },
                {
                    $group: {
                        _id: "$Sender",
                        UnreadCount: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        SenderId: "$_id",
                        UnreadCount: 1,
                        _id: 0
                    }
                }
            ]);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetUnreadPvtMsgDetails ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetUnreadRoomMsgDetails(loginUserId: any) {
        try {
            const messagesList = await Message.aggregate([
                {
                    $match: {
                        Members: loginUserId,
                        ReadBy: { $ne: loginUserId }
                    }
                },
                {
                    $group: {
                        _id: "$RoomId",
                        UnreadCount: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        RoomId: "$_id",
                        UnreadCount: 1,
                        _id: 0
                    }
                }
            ]);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetUnreadRoomMsgDetails ${JSON.stringify(error)}`);
            throw error;
        }
    }



}
