import cacheClient = require("./no-cache");
// import cacheClient = require("./redis-cache");
let ioSocket: any;


export function InitializeConnection(argIOSocket: any) {
    ioSocket = argIOSocket;
    ioSocket.on("connection", async function (socket) {
        console.log(`Client connected: ${socket.id}`);

        socket.on("disconnect", function () {
            // No need to call socket.leave it will automatically remove.
            console.log(`Client disconnected: ${socket.id}`);
            if (socket.data.UserId != null && socket.data.UserId != '') {
                console.log("User Leaving Chat " + socket.data.UserId);
                const userOnline = cacheClient.RemoveSocketFromConnectedClients(socket.data.UserId, socket.id);
                EmitRelayInfoToRoom('UserState-' + socket.data.UserId, "UserState", { UserId: socket.data.UserId, Online: userOnline });
                EmitTypingStopToRoom(socket);
            }
        });

        socket.on("JoinChat", async function (userId: any) {
            console.log("User Joining Chat " + userId);
            socket.data.UserId = userId;
            const userOnline = cacheClient.AddSocketToConnectedClients(socket.data.UserId, socket.id);
            EmitRelayInfoToRoom('UserState-' + userId, "UserState", { UserId: socket.data.UserId, Online: userOnline });
        });

        socket.on("LeaveChat", async function () {
            console.log("User Leaving Chat " + socket.data.UserId);
            const userOnline = cacheClient.RemoveSocketFromConnectedClients(socket.data.UserId, socket.id);
            EmitRelayInfoToRoom('UserState-' + socket.data.UserId, "UserState", { UserId: socket.data.UserId, Online: userOnline });
            EmitTypingStopToRoom(socket);
        });

        socket.on("ListenUserState", async function (userIds: any) {
            console.log("Listen Online state of user " + JSON.stringify(userIds));
            userIds.forEach((userId: any) => {
                socket.join('UserState-' + userId);
                const userOnline = cacheClient.GetUserOnlineState(userId);
                EmitRelayInfoToClient(socket, "UserState", { UserId: userId, Online: userOnline });
            });
        });

        socket.on("LeaveUserState", async function (userIds: any) {
            console.log("Leave Online state of user " + JSON.stringify(userIds));
            userIds.forEach((userId: any) => {
                socket.leave('UserState-' + userId);
            });
        });

        socket.on("JoinMessageRoom", async function (roomIds: any) {
            console.log("User Joining Chat Room for " + JSON.stringify(roomIds));
            roomIds.forEach((roomId: any) => {
                socket.join(roomId);
            });
        });

        socket.on("LeaveMessageRoom", async function (roomIds: any) {
            console.log("User Leaving Chat Room for " + JSON.stringify(roomIds));
            roomIds.forEach((roomId: any) => {
                socket.leave(roomId);
            });
        });

        socket.on("NewChatRoomMessage", function (payload: any) {
            EmitRelayInfoToRoom(payload.RoomId, "NewMessage", payload);
        });

        socket.on("NewPrivateMessage", function (payload: any) {
            const sockets = cacheClient.GetUserSockets(payload.Receiver);
            sockets.forEach((argSocket: any) => {
                ioSocket.to(argSocket).emit("NewMessage", payload);
            });
        });

        socket.on("UserPvtMsgTyping", function (payload: any) {
            const sockets = cacheClient.GetUserSockets(payload.Receiver);
            sockets.forEach((argSocket: any) => {
                ioSocket.to(argSocket).emit("UserTyping", payload);
            });
        });

        socket.on("UserRoomMsgTyping", function (payload: any) {
            socket.data.RoomId = payload.RoomId;
            EmitRelayInfoToRoom(payload.RoomId, "UserTyping", payload);
        });

        socket.on("PvtMessageRead", function (payload: any) {
            const sockets = cacheClient.GetUserSockets(payload.SentBy);
            sockets.forEach((argSocket: any) => {
                ioSocket.to(argSocket).emit("MessageRead", payload);
            });
        });

    });
}

function EmitRelayInfoToRoom(roomId: any, msgName: any, info: any) {
    ioSocket.sockets.in(roomId).emit(msgName, info);
}

function EmitRelayInfoToClient(socket: any, msgName: any, info: any) {
    socket.emit(msgName, info);
}

function EmitTypingStopToRoom(socket: any) {
    if (socket.data.RoomId != null && socket.data.RoomId != '') {
        EmitRelayInfoToRoom(socket.data.RoomId, "UserTyping", {
            RoomId: socket.data.RoomId,
            UserId: socket.data.UserId,
            Typing: false
        });
    }
}