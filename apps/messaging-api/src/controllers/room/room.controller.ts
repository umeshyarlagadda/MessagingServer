import { Controller, Post, Get, Res, Req, Put, UseGuards, UseFilters, Delete } from '@nestjs/common';
import { ObjectId } from "bson";
import { Response, Request } from 'express';
import { ExceptionHandler } from '../../utils/exception-handler/exception-handler';
import { UserAuthGuardService } from '../../services/user-auth-guard/user-auth-guard.service';
import { MessageService } from '../../services/message/message.service';
import { RoomService } from '../../services/room/room.service';

@Controller('messageapi/secure/Room')
@UseGuards(UserAuthGuardService)
export class RoomController {

    constructor(public roomSrvc: RoomService) { }

    @Get("PublicRoomBetween")
    @UseFilters(ExceptionHandler)
    async get(@Req() req: Request, @Res() res: Response) {
        const resp = await this.roomSrvc.CheckAndGetPublicChatRoomBetween(req.query.LoginUserEId, req.query.ParticipantEId);
        res.json(resp);
    }

    @Post("Create")
    @UseFilters(ExceptionHandler)
    async createRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.roomSrvc.CreateRoom(req.body.Name, res.locals.User.Id);
        res.json(resp);
    }

    @Delete("Delete/:roomId")
    @UseFilters(ExceptionHandler)
    async deleteRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.roomSrvc.DeleteRoom(req.params.roomId, res.locals.User.Id);
        res.json(resp);
    }

    @Put("UpdateName/:roomId")
    @UseFilters(ExceptionHandler)
    async updateRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.roomSrvc.UpdateRoomName(req.body.Name, req.params.roomId, res.locals.User.Id);
        res.json(resp);
    }

    @Put("AddMember/:roomId")
    @UseFilters(ExceptionHandler)
    async addMemberInRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.roomSrvc.AddMemberInRoom(req.body.NewMember, req.params.roomId);
        res.json(resp);
    }

    @Put("UpdateMember/:roomId")
    @UseFilters(ExceptionHandler)
    async updateMemberInRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.roomSrvc.UpdateMemberInRoom(req.body.ExistingMember, req.params.roomId);
        res.json(resp);
    }

    @Put("RemoveMember/:roomId")
    @UseFilters(ExceptionHandler)
    async removeMemberInRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.roomSrvc.RemoveMemberInRoom(req.body.ExistingMemberId, req.params.roomId);
        res.json(resp);
    }

    @Get("ChatRooms")
    @UseFilters(ExceptionHandler)
    async getClientRooms(@Req() req: Request, @Res() res: Response) {
        const resp = await this.roomSrvc.GetChatRooms(res.locals.User.Id);
        res.json(resp);
    }

}