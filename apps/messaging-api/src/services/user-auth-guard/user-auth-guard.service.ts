import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as throwjs from 'throw.js';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { LoginSession } from '../../models/login-session';

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
            jwt.verify(token, process.env.JWTSecretKey, async (err: any, jwtInfo: any) => {
              if (err) {
                resolve({
                  Valid: false,
                  Code: 401
                });
              } else {
                const loginSession = await LoginSession.findOne({
                  AccessToken: token, UserId: jwtInfo.UserId, Out: null
                });
                if (loginSession == null) {
                  resolve({
                    Valid: false,
                    Code: 403
                  });
                } else {
                  res.locals.User = {
                    Id: jwtInfo.UserId
                  };
                  resolve({
                    Valid: true
                  });
                }
              }
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
