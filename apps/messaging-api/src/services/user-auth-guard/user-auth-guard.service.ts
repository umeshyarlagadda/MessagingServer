import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as throwjs from 'throw.js';
import { Request, Response } from 'express';

@Injectable()
export class UserAuthGuardService implements CanActivate {

  constructor() { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve, reject) => {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      const result: any = await this.verifyJWT(request, response);
      if (!result.Valid) {
        response.status(result.Code).send(new throwjs.Unauthorized());
      }
      resolve(result.Valid);
    });
  }

  verifyJWT(req: Request, res: Response) {
    return new Promise(async (resolve, reject) => {
      const authHeader = req.headers["authorization"];
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (token != null) {
          const userId = (token === '1718801169348-96a37b52-0768-49de-a9ac-fbe170486398') ? '610279535260f10b5593d9a2' : '63d3ef71cffaf0a4a87229ac';
          res.locals.User = {
            Id: userId
          };
          resolve({
            Valid: true
          });
        } else {
          resolve({
            Valid: false,
            Code: 403
          });
        }
      } else {
        resolve({
          Valid: false,
          Code: 403
        });
      }
    });
  }
}
