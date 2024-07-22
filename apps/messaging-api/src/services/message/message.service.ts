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

    async MarkMessagesAsFavorite(messageId: any, loginUserId: any) {
        try {
            const updatedMsgInfo = await Message.findOneAndUpdate({ _id: messageId }, { $addToSet: { "Fav": loginUserId } }, { new: true });
            return updatedMsgInfo;
        } catch (error) {
            this.logger.error(`Error while MarkMessagesAsFavorite ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async UnmarkMessagesAsFavorite(messageId: any, loginUserId: any) {
        try {
            const updatedMsgInfo = await Message.findOneAndUpdate({ _id: messageId }, { $pull: { "Fav": loginUserId } }, { new: true });
            return updatedMsgInfo;
        } catch (error) {
            this.logger.error(`Error while UnmarkMessagesAsFavorite ${JSON.stringify(error)}`);
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
            if (msgInfo.NewMember) {
                const updatedRoom = await ChatRoom.findByIdAndUpdate({ _id: msgInfo.RoomId },
                    { $addToSet: { Members: { UserId: msgInfo.Sender, Name: msgInfo.MemberName, Write: true } } }, { new: true });
                if (updatedRoom != null) {
                    this.socketSrvc.EmitValueToSocket('UpdateRoomDetails', updatedRoom);
                } else {
                    throw { message: "Sorry this message can't be sent" };
                }
            }
            msgInfo = new Message(msgInfo);
            const savedMsg = await msgInfo.save();
            this.socketSrvc.EmitValueToSocket('NewChatRoomMessage', savedMsg);
            return savedMsg;
        } catch (error) {
            this.logger.error(`Error while SendRoomMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetInitialPrivateMessagesBetweenUsers(loginUserId: any, participantUserId: any, resultsPerRequest: any) {
        try {
            const messagesList = await Message.find({
                $or: [
                    { Sender: loginUserId, Receiver: participantUserId },
                    { Sender: participantUserId, Receiver: loginUserId }
                ]
            }).sort({ _id: -1 }).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetInitialPrivateMessagesBetweenUsers ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetInitialMessagesOfRoom(roomId: any, resultsPerRequest: any) {
        try {
            const messagesList = await Message.find({ RoomId: roomId }).sort({ _id: -1 }).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetMessagesOfRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetNextPrivateMessagesBetweenUsers(loginUserId: any, participantUserId: any, lastRecordId: any, resultsPerRequest: any) {
        try {
            const messagesList = await Message.find({
                _id: { $gt: lastRecordId },
                $or: [
                    { Sender: loginUserId, Receiver: participantUserId },
                    { Sender: participantUserId, Receiver: loginUserId }
                ]
            }).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetNextPrivateMessagesBetweenUsers ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetNextMessagesOfRoom(roomId: any, lastRecordId: any, resultsPerRequest: any) {
        try {
            const messagesList = await Message.find({ _id: { $gt: lastRecordId }, RoomId: roomId }).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetNextMessagesOfRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetPreviousPrivateMessagesBetweenUsers(loginUserId: any, participantUserId: any, firstRecordId: any, resultsPerRequest: any) {
        try {
            const messagesList = await Message.find({
                _id: { $lt: firstRecordId },
                $or: [
                    { Sender: loginUserId, Receiver: participantUserId },
                    { Sender: participantUserId, Receiver: loginUserId }
                ]
            }).sort({ _id: -1 }).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetPreviousPrivateMessagesBetweenUsers ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetPreviousMessagesOfRoom(roomId: any, firstRecordId: any, resultsPerRequest: any) {
        try {
            const messagesList = await Message.find({ _id: { $lt: firstRecordId }, RoomId: roomId }).sort({ _id: -1 }).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetPreviousMessagesOfRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }




    async GetPrivateMessagesBetweenUsersByDate(loginUserId: any, participantUserId: any, searchDt: any, resultsPerRequest: any) {
        try {
            const messagesList = await Message.find({
                CrDt: { $gte: searchDt },
                $or: [
                    { Sender: loginUserId, Receiver: participantUserId },
                    { Sender: participantUserId, Receiver: loginUserId }
                ]
            }).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetPrivateMessagesBetweenUsersByDate ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetMessagesOfRoomByDate(roomId: any, searchDt: any, resultsPerRequest: any) {
        try {
            const messagesList = await Message.find({ CrDt: { $gte: searchDt }, RoomId: roomId }).limit(resultsPerRequest);
            return messagesList;
        } catch (error) {
            this.logger.error(`Error while GetMessagesOfRoomByDate ${JSON.stringify(error)}`);
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
            const roomsList = await ChatRoom.aggregate([
                // Match chatrooms where the user is a member
                {
                    $match: {
                        "Members.UserId": loginUserId, // Replace userId with the actual user ID
                    }
                },
                // Lookup messages collection to find unread messages sent by others
                {
                    $lookup: {
                        from: "ConnectX.Messages",
                        let: { roomId: "$_id", userId: loginUserId }, // Use $_id from chatrooms and userId from match stage
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$RoomId", "$$roomId"] }, // Match messages with roomId from chatrooms
                                            { $ne: ["$Sender", "$$userId"] }, // Message not sent by the user
                                            { $not: { $in: ["$$userId", "$ReadBy"] } } // User has not read the message
                                        ]
                                    }
                                }
                            },
                            {
                                $count: "unreadMessageCount" // Count unread messages for each chatroom
                            }
                        ],
                        as: "unreadMessages"
                    }
                },
                // Filter chatrooms with unread messages
                {
                    $match: {
                        unreadMessages: { $ne: [] } // Filter chatrooms with unread messages
                    }
                },
                // Project to include necessary fields
                {
                    $project: {
                        _id: 1,
                        UnreadCount: { $arrayElemAt: ["$unreadMessages.unreadMessageCount", 0] } // Get unreadMessageCount from array
                    }
                }
            ])
            return roomsList;
        } catch (error) {
            this.logger.error(`Error while GetUnreadRoomMsgDetails ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async IsLastPrivateMessage(loginUserId: any, participantUserId: any, recordId: any) {
        try {
            const lastMessage = await Message.findOne({
                $or: [
                    { Sender: loginUserId, Receiver: participantUserId },
                    { Sender: participantUserId, Receiver: loginUserId }
                ]
            }).sort({ _id: -1 });
            if (lastMessage != null && lastMessage._id + '' == recordId) {
                return lastMessage;
            } else {
                throw { message: "Sorry this message can't be deleted" };
            }
        } catch (error) {
            this.logger.error(`Error while IsLastPrivateMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async DeletePrivateMessage(lastMessage: any) {
        try {
            const deleteInfo = await Message.deleteOne({ _id: lastMessage._id });
            if (deleteInfo.acknowledged && deleteInfo.deletedCount > 0) {
                this.socketSrvc.EmitValueToSocket('DeletedPrivateMessage', lastMessage);
                return lastMessage;
            } else {
                throw { message: "Sorry this message can't be deleted" };
            }
        } catch (error) {
            this.logger.error(`Error while DeletePrivateMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async IsLastRoomMessage(roomId: any, recordId: any) {
        try {
            const lastMessage = await Message.findOne({
                RoomId: roomId
            }).sort({ _id: -1 });
            if (lastMessage != null && lastMessage._id + '' == recordId) {
                return lastMessage;
            } else {
                throw { message: "Sorry this message can't be deleted" };
            }
        } catch (error) {
            this.logger.error(`Error while IsLastRoomMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async DeleteRoomMessage(lastMessage: any) {
        try {
            const deleteInfo = await Message.deleteOne({ _id: lastMessage._id });
            if (deleteInfo.acknowledged && deleteInfo.deletedCount > 0) {
                this.socketSrvc.EmitValueToSocket('DeletedRoomMessage', lastMessage);
                return lastMessage;
            } else {
                throw { message: "Sorry this message can't be deleted" };
            }
        } catch (error) {
            this.logger.error(`Error while DeleteRoomMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async EditPrivateMessage(msgInfo: any) {
        try {
            const lastMessage = await Message.findOne({
                $or: [
                    { Sender: msgInfo.Sender, Receiver: msgInfo.Receiver },
                    { Sender: msgInfo.Receiver, Receiver: msgInfo.Sender }
                ]
            }).sort({ _id: -1 });
            if (lastMessage != null && lastMessage._id + '' == msgInfo._id) {
                const updatedMsgInfo = await Message.findOneAndUpdate({ _id: msgInfo._id }, { $set: { Msg: msgInfo.Msg, Edit: true } }, { new: true });
                this.socketSrvc.EmitValueToSocket('UpdatedPrivateMessage', updatedMsgInfo);
                return updatedMsgInfo;
            } else {
                throw { message: "Sorry this message can't be edited" };
            }
        } catch (error) {
            this.logger.error(`Error while EditPrivateMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async EditRoomMessage(msgInfo: any) {
        try {
            const lastMessage = await Message.findOne({
                RoomId: msgInfo.RoomId
            }).sort({ _id: -1 });
            if (lastMessage != null && lastMessage._id + '' == msgInfo._id) {
                const updatedMsgInfo = await Message.findOneAndUpdate({ _id: msgInfo._id }, { $set: { Msg: msgInfo.Msg, Edit: true } }, { new: true });
                this.socketSrvc.EmitValueToSocket('UpdatedRoomMessage', updatedMsgInfo);
                return updatedMsgInfo;
            } else {
                throw { message: "Sorry this message can't be edited" };
            }
        } catch (error) {
            this.logger.error(`Error while EditRoomMessage ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async UpdateMessageFiles(recordId: any, latestFiles: any, isPrivateRoom: boolean) {
        try {
            const updatedMsgInfo = await Message.findOneAndUpdate({ _id: recordId }, { $set: { Files: latestFiles } }, { new: true });
            if (isPrivateRoom) {
                this.socketSrvc.EmitValueToSocket('UpdatedPrivateMessage', updatedMsgInfo);
            } else {
                this.socketSrvc.EmitValueToSocket('UpdatedRoomMessage', updatedMsgInfo);
            }
            return updatedMsgInfo;
        } catch (error) {
            this.logger.error(`Error while UpdateMessageFiles ${JSON.stringify(error)}`);
            throw error;
        }
    }

}
