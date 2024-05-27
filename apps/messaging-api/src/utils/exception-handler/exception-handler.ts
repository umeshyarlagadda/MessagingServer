import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class ExceptionHandler implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (exception instanceof HttpException) {
            return response;
        } else {
            const request = ctx.getRequest();
            let status =
                exception instanceof HttpException
                    ? exception.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;
            let data: any = '';
            let message: any = '';
            if (exception.status != null && exception.status != '') {
                status = exception.status;
            }
            if (exception.data != null && exception.data != '') {
                data = exception.data;
            }
            if (exception.message != null && exception.message != '') {
                message = exception.message;
            } else {
                message = 'Internal server error';
            }
            const errorInfo = {
                data: data,
                message: message,
                status: status,
                timestamp: new Date().toISOString(),
                path: request.url
            };
            return response.status(status).json(errorInfo);
        }
    }
}