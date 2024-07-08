import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';
import { GetForgotPasswordSMS } from 'messaging/sms/sms';

import { SNSClient } from "@aws-sdk/client-sns";
import { PublishCommand } from "@aws-sdk/client-sns";


@Injectable()
export class SmsService {

    snsClient: any;

    constructor(public configSrvc: ConfigService) {

    }

    InitializeProvider() {
        this.snsClient = new SNSClient({
            apiVersion: 'latest',
            region: this.configSrvc.awsSMSConfig.SNS_Account_Region,
            credentials: {
                accessKeyId: this.configSrvc.awsSMSConfig.SNS_Account_Access_Key,
                secretAccessKey: this.configSrvc.awsSMSConfig.SNS_Account_Secret_Key
            }
        });
    }

    async SendForgotPasswordSMS(phone: any, verifyCode: any) {
        let message: any = GetForgotPasswordSMS(verifyCode);
        try {
            let response = await this.SendSMS(phone, message);
            return response;
        } catch (err) {
            throw err;
        }
    }

    private async SendSMS(to_number: any, message: any) {
        try {
            const publishInfo = new PublishCommand({
                PhoneNumber: to_number,
                Message: message,
                MessageAttributes: {
                    "AWS.SNS.SMS.SMSType": {
                        DataType: "String",
                        StringValue: "Transactional",
                    },
                    "AWS.SNS.SMS.SenderID": {
                        DataType: "String",
                        StringValue: "Multibix"
                    }
                }
            });
            const data = await this.snsClient.send(publishInfo);
            return data.MessageId;
        } catch (err) {
            return Promise.reject(err);
        }
    }

}