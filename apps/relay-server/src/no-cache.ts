import relayConnections = require("./relay-connections");

const connectedClients = [];

export function StartConnection(redisServerURL: string, relayServerRealPort: any) {
    const app = require('express')();
    const server = require('http').createServer(app);
    const ioSocket = require('socket.io')(server, { path: "/wsockets" });
    ioSocket.listen(Number(relayServerRealPort));
    relayConnections.InitializeConnection(ioSocket);
}

export function AddSocketToConnectedClients(userId: any, socketId: any) {
    // when user is connected in then we will take the socket id and user id into connectedclients list
    // since the user can login from multiple devices, so we need to link user id with array of sockets
    // we need to check whether user id already exists in our connected clients list
    let userIndex = GetConnectedUserIndex(userId);
    if (userIndex !== -1) {
        // the user id already exists in our list.so we will push the new socket id in to the sockets list
        // and we will emit a event to all the users who are viewing this user page.This will be help
        // to show online notification.
        connectedClients[userIndex].Sockets.push(socketId);
    } else {
        // we will build a basic user connection info.
        const newClientInfo = {
            UserId: userId,
            Sockets: [socketId],
        };
        // we will add the user to connected users list.
        connectedClients.push(newClientInfo);
    }
    return true;
}

export function RemoveSocketFromConnectedClients(userId: any, socketId: any) {
    let userIndex = GetConnectedUserIndex(userId);
    // when user is disconnected, we will check the index of user in connected users list
    if (userIndex !== -1) {
        const socketIndex = connectedClients[userIndex].Sockets.indexOf(socketId);
        if (socketIndex !== -1) {
            // since user can have mutliple active sockets, we will just remove a disconnected socket from the list
            connectedClients[userIndex].Sockets.splice(socketIndex, 1);
            if (connectedClients[userIndex].Sockets.length !== 0) {
                return true;
            }
        }
    }
    return false;
}

export function GetUserOnlineState(userId: any) {
    let userIndex = GetConnectedUserIndex(userId);
    if (userIndex !== -1 && connectedClients[userIndex].Sockets.length !== 0) {
        return true;
    } else {
        return false;
    }
}

function GetConnectedUserIndex(UserId: any) {
    let userIndex: number = connectedClients.findIndex((client: any) => {
        return client.UserId === UserId;
    });
    return userIndex;
}
