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
      const userId: any = req.headers["userid"];
      const authHeader = req.headers["authorization"];
      const token = (authHeader) ? authHeader.split(" ")[1] : null;
      if (token != null && userId != null) {
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
    });
  }
}
