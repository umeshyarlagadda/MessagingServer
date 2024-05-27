import { Injectable } from '@nestjs/common';
import { io } from "socket.io-client";
@Injectable()
export class SocketService {

    socket: any;
    socketConnected: boolean = false;

    constructor() { }

    InitializeSocket() {
        this.socket = io(process.env.Relay_Server_Url, { path: '/wsockets', rememberUpgrade: true, transports: ["websocket"] });
        this.socket.on("connect", () => {
            this.socketConnected = true;
            console.log("Connected to Relay Server...");
        });
        this.socket.on("disconnect", (reason) => {
            this.socketConnected = false;
            console.log("Disconnected from server... ");
            console.log(reason);
            if (reason === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
                this.socket.connect();
            }
        });
    }

    DisconnectSocket() {
        if (this.socketConnected) {
            this.socket.emit("'UserDisconnect");
            this.socketConnected = false;
        }
    }

    EmitUpdatedValues(messageName: any, latestValues: any) {
        if (this.socketConnected) {
            this.socket.emit(messageName, latestValues);
        }
    }
}
