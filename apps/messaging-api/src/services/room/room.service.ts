import { ChatRoom } from '../../models/chat-room';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class RoomService {

    constructor(public logger: PinoLogger, public socketSrvc: SocketService) {
        this.logger.setContext(RoomService.name);
    }

    async CreateRoom(roomName: any, loginUserId: any) {
        try {
            let roomInfo: any = {
                Name: roomName,
                Members: [
                    {
                        _id: loginUserId,
                        CrBy: true,
                        // Admin:true,
                        // Write:true
                    }
                ]
            };
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
            const updateRoomInfo = await ChatRoom.findOneAndUpdate({
                _id: roomId,
                Members: {
                    $elemMatch: { "_id": loginUserId, "CrBy": true }
                },
            }, { $set: { Del: true } }, { new: true });
            return updateRoomInfo;
        } catch (error) {
            this.logger.error(`Error while DeleteRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async UpdateRoomName(roomName: any, roomId: any, loginUserId: any) {
        try {
            const updateRoomInfo = await ChatRoom.findOneAndUpdate({
                _id: roomId,
                Members: {
                    $elemMatch: { "_id": loginUserId, "Admin": true }
                },
            }, { $set: { Name: roomName } }, { new: true });
            return updateRoomInfo;
        } catch (error) {
            this.logger.error(`Error while UpdateRoomName ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async AddMemberInRoom(newMemberInfo: any, roomId: any) {
        try {
            const updateRoomInfo = await ChatRoom.findOneAndUpdate({
                "_id": roomId, "Members._id": { $ne: newMemberInfo._id }
            }, { $addToSet: { Members: newMemberInfo } }, { new: true });
            return updateRoomInfo;
        } catch (error) {
            this.logger.error(`Error while AddMemberInRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async UpdateMemberInRoom(existingMemberInfo: any, roomId: any) {
        try {
            const updateRoomInfo = await ChatRoom.findOneAndUpdate({
                "_id": roomId, "Members._id": existingMemberInfo._id
            }, { $set: { "Members.$": existingMemberInfo } }, { new: true });
            return updateRoomInfo;
        } catch (error) {
            this.logger.error(`Error while UpdateMemberInRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async RemoveMemberInRoom(memberId: any, roomId: any) {
        try {
            const updateRoomInfo = await ChatRoom.findOneAndUpdate({ _id: roomId }, { $pull: { "Members": { "_id": memberId } } }, { new: true });
            return updateRoomInfo;
        } catch (error) {
            this.logger.error(`Error while RemoveMemberInRoom ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetChatRooms(loginUserId: any) {
        try {
            const roomsList = await ChatRoom.find({ "Members._id": loginUserId, "Del": { $ne: true } });
            return roomsList;
        } catch (error) {
            this.logger.error(`Error while GetChatRooms ${JSON.stringify(error)}`);
            throw error;
        }
    }

}