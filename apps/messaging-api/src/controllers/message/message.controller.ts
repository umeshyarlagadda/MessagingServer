import { Controller, Post, Get, Res, Req, Put, UseGuards, UseFilters, Delete } from '@nestjs/common';
import { ObjectId } from "bson";
import { Response, Request } from 'express';
import { ExceptionHandler } from '../../utils/exception-handler/exception-handler';
import { UserAuthGuardService } from '../../services/user-auth-guard/user-auth-guard.service';
import { MessageService } from '../../services/message/message.service';

@Controller('messageapi/secure/Message')
@UseGuards(UserAuthGuardService)
export class MessageController {

    constructor(public messageSrvc: MessageService) { }

    @Post("SendPrivateMsg")
    @UseFilters(ExceptionHandler)
    async sendPrivateMessage(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.SendPrivateMessage(req.body);
        res.json(resp);
    }

    @Post("SendRoomMsg")
    @UseFilters(ExceptionHandler)
    async sendRoomMessage(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.SendRoomMessage(req.body);
        res.json(resp);
    }

    @Put("MarkasRead")
    @UseFilters(ExceptionHandler)
    async markMessageAsRead(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.MarkMessagesAsRead(req.body.MessageIds, res.locals.User.Id);
        res.json(resp);
    }

    @Get("PrivateMessages")
    @UseFilters(ExceptionHandler)
    async getPrivateMessages(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetPrivateMessagesBetweenUsers(res.locals.User.Id, req.query.ParticipantId, req.query.Page, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("RoomMessages")
    @UseFilters(ExceptionHandler)
    async getChatRoomMessages(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetMessagesOfRoom(req.query.RoomId, req.query.Page, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("GetUnreadPvtMsgDetails")
    @UseFilters(ExceptionHandler)
    async getUnreadPvtMsgDetails(@Req() req: Request, @Res() res: Response) {
        const loginUserId: ObjectId = new ObjectId(res.locals.User.Id);
        const resp = await this.messageSrvc.GetUnreadPvtMsgDetails(loginUserId);
        res.json(resp);
    }

    @Get("GetUnreadRoomMsgDetails")
    @UseFilters(ExceptionHandler)
    async getUnreadRoomMsgDetails(@Req() req: Request, @Res() res: Response) {
        const loginUserId: ObjectId = new ObjectId(res.locals.User.Id);
        const resp = await this.messageSrvc.GetUnreadRoomMsgDetails(loginUserId);
        res.json(resp);
    }



}