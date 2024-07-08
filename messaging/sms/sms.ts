export function GetForgotPasswordSMS(verifyCode: any) {
    let message: any = `Forgot Password Verification Code is ${verifyCode}`;
    return message;
}