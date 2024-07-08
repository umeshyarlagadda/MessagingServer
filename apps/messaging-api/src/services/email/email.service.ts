import { Injectable } from '@nestjs/common';

import { ConfigService } from '@app/config';

import * as nodemailer from 'nodemailer';

import * as Email from 'email-templates';

import * as path from 'path';

let aws = require("@aws-sdk/client-ses");

@Injectable()
export class EmailService {

    email: any;

    constructor(public configSrvc: ConfigService) {

    }

    InitializeProvider() {
        const ses = new aws.SES({
            apiVersion: 'latest',
            region: this.configSrvc.awsEmailConfig.SES_Account_Region,
            credentials: {
                accessKeyId: this.configSrvc.awsEmailConfig.SES_Account_Access_Key,
                secretAccessKey: this.configSrvc.awsEmailConfig.SES_Account_Secret_Key
            }
        });

        let SEStransporter = nodemailer.createTransport({
            SES: { ses, aws }
        });

        this.email = new Email({
            send: true,
            preview: false,
            transport: SEStransporter,
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: path.join(__dirname, "./../messaging/email/templates/css"),
                    images: true
                },
            },
        });
    }

    async SendForgotPassword(userName: string, verificationCode: any, sendTo: string) {
        return new Promise((resolve, reject) => {
            this.email.send({
                template: path.join(__dirname, "./../messaging/email/templates/forgot-password"),
                message: {
                    to: sendTo,
                    from: `${this.configSrvc.awsEmailConfig.Account_Sender_Name}<${this.configSrvc.awsEmailConfig.Account_Sender_Email}>`,
                    attachments: [
                        {
                            filename: 'CryptoCustodyTrust-deck 1.pdf',
                            path: path.join(__dirname, "./../messaging/email/attachments/CryptoCustodyTrust-deck 1.pdf")
                        }
                    ]
                },
                locals: {
                    Code: verificationCode,
                    CCT_Banner_Img: 'https://www.cryptocustodytrust.com/assets/images/email-logo.png',
                    userName: userName,
                }
            }).then((resp: any) => {
                resolve(resp);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

}