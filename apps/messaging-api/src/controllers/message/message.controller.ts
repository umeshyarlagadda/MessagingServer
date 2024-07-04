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

    @Put("MarkasFavorite/:messageId")
    @UseFilters(ExceptionHandler)
    async markMessageAsFavorite(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.MarkMessagesAsFavorite(req.params.messageId, res.locals.User.Id);
        res.json(resp);
    }

    @Put("UnmarkasFavorite/:messageId")
    @UseFilters(ExceptionHandler)
    async unmarkMessageAsFavorite(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.UnmarkMessagesAsFavorite(req.params.messageId, res.locals.User.Id);
        res.json(resp);
    }

    @Get("InitialPrivateMessages")
    @UseFilters(ExceptionHandler)
    async getInitialPrivateMessagesBetweenUsers(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetInitialPrivateMessagesBetweenUsers(res.locals.User.Id, req.query.ParticipantId, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("InitialRoomMessages")
    @UseFilters(ExceptionHandler)
    async getInitialMessagesOfRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetInitialMessagesOfRoom(req.query.RoomId, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("NextPrivateMessages")
    @UseFilters(ExceptionHandler)
    async getNextPrivateMessagesBetweenUsers(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetNextPrivateMessagesBetweenUsers(res.locals.User.Id, req.query.ParticipantId, req.query.RecordId, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("NextRoomMessages")
    @UseFilters(ExceptionHandler)
    async getNextMessagesOfRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetNextMessagesOfRoom(req.query.RoomId, req.query.RecordId, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("PreviousPrivateMessages")
    @UseFilters(ExceptionHandler)
    async getPreviousPrivateMessagesBetweenUsers(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetPreviousPrivateMessagesBetweenUsers(res.locals.User.Id, req.query.ParticipantId, req.query.RecordId, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("PreviousRoomMessages")
    @UseFilters(ExceptionHandler)
    async getPreviousMessagesOfRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetPreviousMessagesOfRoom(req.query.RoomId, req.query.RecordId, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("PrivateMessagesByDate")
    @UseFilters(ExceptionHandler)
    async getPrivateMessagesByDate(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetPrivateMessagesBetweenUsersByDate(res.locals.User.Id, req.query.ParticipantId, req.query.SearchDt, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("RoomMessagesByDate")
    @UseFilters(ExceptionHandler)
    async getChatRoomMessagesByDate(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetMessagesOfRoomByDate(req.query.RoomId, req.query.SearchDt, req.query.ResultsPerPage);
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