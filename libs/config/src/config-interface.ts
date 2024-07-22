export interface AWSEmailConfig {
    Account_Sender_Name: string,
    Account_Sender_Email: string,
    SES_Account_Region: string,
    SES_Account_Access_Key: string,
    SES_Account_Secret_Key: string
}

export interface AWSSmsConfig {
    SNS_Account_Region: string,
    SNS_Account_Access_Key: string,
    SNS_Account_Secret_Key: string
}

export interface AWSS3Config {
    S3_Access_Key:string,
    S3_Secret_Key:string,
    S3_Region:string,
    S3_Messaging_Bucket:string
}
