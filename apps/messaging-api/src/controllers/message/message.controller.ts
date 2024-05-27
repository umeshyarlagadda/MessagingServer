import { Controller, Post, Get, Res, Req, Put, UseGuards, UseFilters, Delete } from '@nestjs/common';
import { ObjectId } from "bson";
import { Response, Request } from 'express';
import { ExceptionHandler } from '../../utils/exception-handler/exception-handler';
import { UserAuthGuardService } from '../../services/user-auth-guard/user-auth-guard.service';
import { MessageService } from '../../services/message/message.service';

@Controller('api/secure/Message')
@UseGuards(UserAuthGuardService)
export class MessageController {

    constructor(public messageSrvc: MessageService) { }

    @Post("CreateRoom")
    @UseFilters(ExceptionHandler)
    async createRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.CreateRoom(req.body, res.locals.User.Id);
        res.json(resp);
    }

    @Delete("DeleteRoom/:roomId")
    @UseFilters(ExceptionHandler)
    async deleteRoom(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.DeleteRoom(req.params.roomId, res.locals.User.Id);
        res.json(resp);
    }

    @Post("Send")
    @UseFilters(ExceptionHandler)
    async sendMessage(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.SendMessage(req.body);
        res.json(resp);
    }

    @Put("MarkasRead")
    @UseFilters(ExceptionHandler)
    async markMessageAsRead(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.MarkMessagesAsRead(req.body.MessageIds);
        res.json(resp);
    }

    @Get("Messages")
    @UseFilters(ExceptionHandler)
    async getChatRoomMessages(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.GetMessagesOfRoom(req.query.RoomId, req.query.Page, req.query.ResultsPerPage);
        res.json(resp);
    }

    @Get("ChatRooms")
    @UseFilters(ExceptionHandler)
    async getClientRooms(@Req() req: Request, @Res() res: Response) {
        const loginUserId: ObjectId = new ObjectId(res.locals.User.Id);
        const brokerId: ObjectId = new ObjectId(req.query.BrokerId.toString());
        const clientId: ObjectId = new ObjectId(req.query.ClientId.toString());
        const resp = await this.messageSrvc.GetAllMessageRoomsOfBrokerAndClient(brokerId, clientId, loginUserId);
        res.json(resp);
    }

}