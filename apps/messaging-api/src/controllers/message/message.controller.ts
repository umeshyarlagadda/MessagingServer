import { Controller, Post, Get, Res, Req, Put, UseGuards, UseFilters, Delete, UseInterceptors, UploadedFile, UploadedFiles, Body } from '@nestjs/common';
import { ObjectId } from "bson";
import { Response, Request } from 'express';
import { ExceptionHandler } from '../../utils/exception-handler/exception-handler';
import { UserAuthGuardService } from '../../services/user-auth-guard/user-auth-guard.service';
import { MessageService } from '../../services/message/message.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { addSeconds, isBefore } from 'date-fns';
import cacheClient = require("../../utils/data-cache/data-cache");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3AccessKey,
        secretAccessKey: process.env.S3PrivateKey
    },
    region: process.env.S3Region
});
const s3Storage = multerS3({
    s3: s3, // s3 instance
    bucket: process.env.S3MessagingBucket, // change it as per your project requirement
    metadata: (req, file, cb) => {
        cb(null, { fieldname: file.fieldname })
    },
    key: (req, file, cb) => {
        const fileName = Date.now() + "_" + file.fieldname + "_" + file.originalname;
        cb(null, fileName);
    }
});
const uploadFile = multer({
    storage: s3Storage,
    fileFilter: (req, file, callback) => {
        const allowedImageTypes = ['image/jpeg', 'image/png'];
        const allowedDocumentTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (allowedImageTypes.includes(file.mimetype) && req.headers['content-length'] <= 1024 * 1024 * 5) {
            callback(null, true); // Accept images.
        } else if (allowedDocumentTypes.includes(file.mimetype) && req.headers['content-length'] <= 1024 * 50) {
            callback(null, true); // Accept documents
        } else {
            callback(new Error('Invalid file type'), false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5, // max 5 MB file size,
        files: 10
    }
});

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

    @Put("EditPrivateMessage")
    @UseFilters(ExceptionHandler)
    async editPrivateMessage(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.EditPrivateMessage(req.body);
        res.json(resp);
    }

    @Put("EditRoomMessage")
    @UseFilters(ExceptionHandler)
    async editRoomMessage(@Req() req: Request, @Res() res: Response) {
        const resp = await this.messageSrvc.EditRoomMessage(req.body);
        res.json(resp);
    }

    @Post("UploadOnlyFile")
    @UseInterceptors(FileInterceptor('file', uploadFile))
    async uploadOnlyFile(@UploadedFile() file: Express.Multer.File, @Res() res): Promise<any> {
        if (file == null) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const fileDetails = {
            Name: file.originalname,
            Url: file['key']
        };
        res.json(fileDetails);
    }

    @Post("UploadFileAndMessage")
    @UseInterceptors(FileInterceptor('file', uploadFile))
    async uploadFileAndMessage(@UploadedFile() file: Express.Multer.File, @Body('msgInfo') argMsgInfo: any, @Res() res): Promise<any> {
        if (file == null) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const fileDetails = {
            Name: file.originalname,
            Url: file['key']
        };
        const msgInfo = JSON.parse(argMsgInfo);
        msgInfo.Files = [fileDetails];
        if (msgInfo.RoomId != null) {
            const resp = await this.messageSrvc.SendRoomMessage(msgInfo);
            res.json(resp);
        } else {
            const resp = await this.messageSrvc.SendPrivateMessage(msgInfo);
            res.json(resp);
        }
    }

    @Get("GetSignedS3Url/:fileKey")
    @UseFilters(ExceptionHandler)
    async getS3SignedURL(@Req() req: Request, @Res() res: Response) {
        // const signedURLInfo = await cacheClient.Get(req.params.fileKey);
        // if (signedURLInfo != null && isBefore(new Date(), new Date(signedURLInfo.ExpiresAt))) {
        //     res.json(signedURLInfo.URL);
        // } else {
        const expiresIn = 15 * 60;
        const command = new GetObjectCommand({ Bucket: process.env.S3MessagingBucket, Key: req.params.fileKey });
        const url = await getSignedUrl(s3, command, { expiresIn: expiresIn }); // expires in seconds
        // cacheClient.Set(req.params.fileKey, { URL: url, ExpiresAt: addSeconds(new Date(), expiresIn) });
        res.json(url);
        // }
    }

    @Get("DownloadS3File/:fileKey")
    @UseFilters(ExceptionHandler)
    async downloadS3File(@Req() req: Request, @Res() res: Response) {
        const command = new GetObjectCommand({ Bucket: process.env.S3MessagingBucket, Key: req.params.fileKey });
        const { Body } = await s3.send(command);
        res.set('Content-Disposition', `attachment; filename="${req.params.fileKey}"`);
        res.set('Content-Type', 'application/octet-stream');
        Body.pipe(res);
    }

    @Delete("DeleteRoomFile")
    @UseFilters(ExceptionHandler)
    async deleteRoomFile(@Req() req: Request, @Res() res: Response) {
        const lastMessage = await this.messageSrvc.IsLastRoomMessage(req.query.RoomId, req.query.RecordId);
        const objectsToDelete: any[] = [{ Key: req.query.FileKey }];
        const command = new DeleteObjectsCommand({
            Bucket: process.env.S3MessagingBucket,
            Delete: {
                Objects: objectsToDelete,
                Quiet: false, // Set to true to suppress response
            },
        });
        const fileDelResp = await s3.send(command);
        if (lastMessage.Msg != null && lastMessage.Msg !== '') {
            const notDeletedFiles = lastMessage.Files.filter((file: any) => {
                const notDeletedIndex = fileDelResp.Deleted.findIndex((deletedFile: any) => {
                    return deletedFile.Key === file.Url;
                });
                return notDeletedIndex === -1;
            });
            const updatedMsgInfo = await this.messageSrvc.UpdateMessageFiles(lastMessage._id, notDeletedFiles, false);
            res.json(updatedMsgInfo);
        } else {
            if (fileDelResp.Deleted.length === lastMessage.Files.length) {
                const resp = await this.messageSrvc.DeleteRoomMessage(lastMessage);
                res.json(resp);
            } else {
                const notDeletedFiles = lastMessage.Files.filter((file: any) => {
                    const notDeletedIndex = fileDelResp.Deleted.findIndex((deletedFile: any) => {
                        return deletedFile.Key === file.Url;
                    });
                    return notDeletedIndex === -1;
                });
                const updatedMsgInfo = await this.messageSrvc.UpdateMessageFiles(lastMessage._id, notDeletedFiles, false);
                res.json(updatedMsgInfo);
            }
        }
    }

    @Delete("DeletePrivateFile")
    @UseFilters(ExceptionHandler)
    async deletePrivateFile(@Req() req: Request, @Res() res: Response) {
        const lastMessage = await this.messageSrvc.IsLastPrivateMessage(res.locals.User.Id, req.query.ParticipantId, req.query.RecordId);
        const objectsToDelete: any[] = [{ Key: req.query.FileKey }];
        const command = new DeleteObjectsCommand({
            Bucket: process.env.S3MessagingBucket,
            Delete: {
                Objects: objectsToDelete,
                Quiet: false, // Set to true to suppress response
            },
        });
        const fileDelResp = await s3.send(command);
        if (lastMessage.Msg != null && lastMessage.Msg !== '') {
            const notDeletedFiles = lastMessage.Files.filter((file: any) => {
                const notDeletedIndex = fileDelResp.Deleted.findIndex((deletedFile: any) => {
                    return deletedFile.Key === file.Url;
                });
                return notDeletedIndex === -1;
            });
            const updatedMsgInfo = await this.messageSrvc.UpdateMessageFiles(lastMessage._id, notDeletedFiles, true);
            res.json(updatedMsgInfo);
        } else {
            if (fileDelResp.Deleted.length === lastMessage.Files.length) {
                const resp = await this.messageSrvc.DeletePrivateMessage(lastMessage);
                res.json(resp);
            } else {
                const notDeletedFiles = lastMessage.Files.filter((file: any) => {
                    const notDeletedIndex = fileDelResp.Deleted.findIndex((deletedFile: any) => {
                        return deletedFile.Key === file.Url;
                    });
                    return notDeletedIndex === -1;
                });
                const updatedMsgInfo = await this.messageSrvc.UpdateMessageFiles(lastMessage._id, notDeletedFiles, true);
                res.json(updatedMsgInfo);
            }
        }
    }

    @Delete("DeletePrivateMessage")
    @UseFilters(ExceptionHandler)
    async deletePrivateMessage(@Req() req: Request, @Res() res: Response) {
        const lastMessage = await this.messageSrvc.IsLastPrivateMessage(res.locals.User.Id, req.query.ParticipantId, req.query.RecordId);
        if (lastMessage.Files != null && lastMessage.Files.length !== 0) {
            const objectsToDelete = lastMessage.Files.map(file => ({ Key: file.Url }));
            const command = new DeleteObjectsCommand({
                Bucket: process.env.S3MessagingBucket,
                Delete: {
                    Objects: objectsToDelete,
                    Quiet: false, // Set to true to suppress response
                },
            });
            const fileDelResp = await s3.send(command);
            if (fileDelResp.Deleted.length === lastMessage.Files.length) {
                const resp = await this.messageSrvc.DeletePrivateMessage(lastMessage);
                res.json(resp);
            } else {
                const notDeletedFiles = lastMessage.Files.filter((file: any) => {
                    const notDeletedIndex = fileDelResp.Deleted.findIndex((deletedFile: any) => {
                        return deletedFile.Key === file.Url;
                    });
                    return notDeletedIndex === -1;
                });
                const updatedMsgInfo = await this.messageSrvc.UpdateMessageFiles(lastMessage._id, notDeletedFiles, true);
                res.json(updatedMsgInfo);
            }
        } else {
            const resp = await this.messageSrvc.DeletePrivateMessage(lastMessage);
            res.json(resp);
        }
    }

    @Delete("DeleteRoomMessage")
    @UseFilters(ExceptionHandler)
    async deleteRoomMessage(@Req() req: Request, @Res() res: Response) {
        const lastMessage = await this.messageSrvc.IsLastRoomMessage(req.query.RoomId, req.query.RecordId);
        if (lastMessage.Files != null && lastMessage.Files.length !== 0) {
            const objectsToDelete = lastMessage.Files.map(file => ({ Key: file.Url }));
            const command = new DeleteObjectsCommand({
                Bucket: process.env.S3MessagingBucket,
                Delete: {
                    Objects: objectsToDelete,
                    Quiet: false, // Set to true to suppress response
                },
            });
            const fileDelResp = await s3.send(command);
            if (fileDelResp.Deleted.length === lastMessage.Files.length) {
                const resp = await this.messageSrvc.DeleteRoomMessage(lastMessage);
                res.json(resp);
            } else {
                const notDeletedFiles = lastMessage.Files.filter((file: any) => {
                    const notDeletedIndex = fileDelResp.Deleted.findIndex((deletedFile: any) => {
                        return deletedFile.Key === file.Url;
                    });
                    return notDeletedIndex === -1;
                });
                const updatedMsgInfo = await this.messageSrvc.UpdateMessageFiles(lastMessage._id, notDeletedFiles, false);
                res.json(updatedMsgInfo);
            }
        } else {
            const resp = await this.messageSrvc.DeleteRoomMessage(lastMessage);
            res.json(resp);
        }
    }

}
