import { Injectable } from '@nestjs/common';
import { Config } from './models/config';
import { PinoLogger } from 'nestjs-pino';

import { AWSEmailConfig, AWSS3Config, AWSSmsConfig } from './config-interface';

@Injectable()
export class ConfigService {

    awsS3Config: AWSS3Config;
    awsSMSConfig: AWSSmsConfig;
    awsEmailConfig: AWSEmailConfig;

    constructor(public logger: PinoLogger) { }

    async GetEntireConfigFromDB() {
        try {
            const configList = await Config.find({});
            this.awsS3Config = this.GetAWSS3Config(configList);
            this.awsSMSConfig = this.GetAWSSMSConfig(configList);
            this.awsEmailConfig = this.GetAWSEmailConfig(configList);
            return true;
        } catch (error) {
            this.logger.error(`Error occured in GetEntireConfigFromDB method : ${JSON.stringify(error)}`);
            throw error;
        }
    }
    
    private GetAWSS3Config(configList: any[]) {
        const index = configList.findIndex((config: any) => {
            return config.Name === "AWSS3";
        });
        return configList[index].Config;
    }

    private GetAWSSMSConfig(configList: any[]) {
        const index = configList.findIndex((config: any) => {
            return config.Name === "AWSSMS";
        });
        return configList[index].Config;
    }

    private GetAWSEmailConfig(configList: any[]) {
        const index = configList.findIndex((config: any) => {
            return config.Name === "AWSEmail";
        });
        return configList[index].Config;
    }

}
