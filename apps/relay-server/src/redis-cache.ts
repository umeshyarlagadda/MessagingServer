import { createClient, RedisClientType } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import relayConnections = require("./relay-connections");
let pubClient: RedisClientType;

export function StartConnection(redisServerURL: string, relayServerRealPort: any) {
    pubClient = createClient({ url: redisServerURL });
    // pubClient = createClient({
    //     password: 'EYGOfLVV3GSRg5Ge8jNCUcLx9Gpys6VT',
    //     socket: {
    //         host: 'redis-11817.c281.us-east-1-2.ec2.cloud.redislabs.com',
    //         port: 11817
    //     }
    // });
    pubClient.on('connect', () => {
        console.log('redis connected');
        ConnectClients(pubClient, subClient, relayServerRealPort);
    });
    pubClient.on('error', (error) => {
        console.log('redis error thrown ' + JSON.stringify(error));
    });
    const subClient: RedisClientType = pubClient.duplicate();
    ConnectClients(pubClient, subClient, relayServerRealPort);
}

function ConnectClients(pubClient: RedisClientType, subClient: RedisClientType, relayServerRealPort: any) {
    if (pubClient.isOpen && subClient.isOpen) {
        return;
    } else {
        console.log('connecting redis');
        Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
            const io = new Server({ path: '/wsockets' });
            const adapter: any = createAdapter(pubClient, subClient);
            io.adapter(adapter);
            io.listen(Number(relayServerRealPort));
            relayConnections.InitializeConnection(io);
            console.log("Redis connected from relay server");
        }).catch((error) => {
            console.log('redis error ' + JSON.stringify(error));
        });
    }
}

function getCacheClient() {
    if (pubClient.isOpen) {
        return pubClient;
    } else {
        return null;
    }
}

export async function Get(keyName: string) {
    try {
        if (getCacheClient() == null) {
            return null;
        }
        const cacheResult = await pubClient.get(keyName);
        if (cacheResult) {
            const resultJSON = JSON.parse(cacheResult);
            return resultJSON;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

export function Set(keyName: string, value: any) {
    if (getCacheClient() == null) {
        return null;
    }
    pubClient.set(keyName, JSON.stringify(value));
    return true;
}

export function Del(keyName: string) {
    if (getCacheClient() == null) {
        return null;
    }
    pubClient.del(keyName);
    return true;
}




export async function RemoveSocketFromConnectedClients(userId: any, socketId: any) {
    const userStateInfo = await Get('UserState-' + userId);
    if (userStateInfo != null && userStateInfo.length !== 0) {
        const socketIndex = userStateInfo.indexOf(socketId);
        if (socketIndex !== -1) {
            // since user can have mutliple active sockets, we will just remove a disconnected socket from the list
            userStateInfo.splice(socketIndex, 1);
            if (userStateInfo.length === 0) {
                Del('UserState-' + userId);
                return false;
            } else {
                Set('UserState-' + userId, userStateInfo);
                return true;
            }
        }
    }
    return false;
}

export async function AddSocketToConnectedClients(userId: any, socketId: any) {
    // when user is connected in then we will take the socket id and user id into connectedclients list
    // since the user can login from multiple devices, so we need to link user id with array of sockets
    // we need to check whether user id already exists in our connected clients list
    const userStateInfo = await Get('UserState-' + userId);
    if (userStateInfo == null || userStateInfo.length === 0) {
        Set('UserState-' + userId, [socketId]);
    } else {
        // the user id already exists in our list.so we will push the new socket id in to the sockets list
        // and we will emit a event to all the users who are viewing this user page.This will be help
        // to show online notification.
        userStateInfo.push(socketId);
        Set('UserState-' + userId, userStateInfo);
    }
    return true;
}

export async function GetUserOnlineState(userId:any){
    const userStateInfo = await Get('UserState-' + userId);
    if (userStateInfo != null && userStateInfo.length !== 0) {
        return true;
    }else{
        return false;
    }
}