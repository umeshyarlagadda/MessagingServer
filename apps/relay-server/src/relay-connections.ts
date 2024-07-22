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
            socket.join('UserUpdates-' + userId);
        });

        socket.on("LeaveChat", async function () {
            console.log("User Leaving Chat " + socket.data.UserId);
            const userOnline = cacheClient.RemoveSocketFromConnectedClients(socket.data.UserId, socket.id);
            EmitRelayInfoToRoom('UserState-' + socket.data.UserId, "UserState", { UserId: socket.data.UserId, Online: userOnline });
            EmitTypingStopToRoom(socket);
            socket.leave('UserUpdates-' + socket.data.UserId);
        });

        socket.on("ListenUserState", async function (userId: any) {
            console.log("Listen Online state of user " + userId);
            socket.join('UserState-' + userId);
            const userOnline = cacheClient.GetUserOnlineState(userId);
            EmitRelayInfoToClient(socket, "UserState", { UserId: userId, Online: userOnline });
        });

        socket.on("LeaveUserState", async function (userId: any) {
            console.log("Leave Online state of user " + userId);
            socket.leave('UserState-' + userId);
        });

        socket.on("JoinMessageRoom", async function (roomId: any) {
            console.log("User Joining Chat Room for " + roomId);
            socket.join(roomId);
        });

        socket.on("LeaveMessageRoom", async function (roomId: any) {
            console.log("User Leaving Chat Room for " + roomId);
            socket.leave(roomId);
        });

        socket.on("NewChatRoomMessage", function (payload: any) {
            EmitRelayInfoToRoom(payload.RoomId, "NewMessage", payload);
        });

        socket.on("NewPrivateMessage", function (payload: any) {
            EmitRelayInfoToRoom('UserUpdates-' + payload.Sender, "NewMessage", payload);
            EmitRelayInfoToRoom('UserUpdates-' + payload.Receiver, "NewMessage", payload);
        });

        socket.on("UserPvtMsgTyping", function (payload: any) {
            EmitRelayInfoToRoom('UserUpdates-' + payload.Receiver, "UserTyping", payload);
        });

        socket.on("UserRoomMsgTyping", function (payload: any) {
            socket.data.RoomId = payload.RoomId;
            EmitRelayInfoToRoom(payload.RoomId, "UserTyping", payload);
        });

        socket.on("PvtMessageRead", function (payload: any) {
            EmitRelayInfoToRoom('UserUpdates-' + payload.SentBy, "MessageRead", payload);
        });

        socket.on("DeletedPrivateMessage", function (payload: any) {
            EmitRelayInfoToRoom('UserUpdates-' + payload.Sender, "DeletedMessage", payload);
            EmitRelayInfoToRoom('UserUpdates-' + payload.Receiver, "DeletedMessage", payload);
        });

        socket.on("DeletedRoomMessage", function (payload: any) {
            EmitRelayInfoToRoom(payload.RoomId, "DeletedMessage", payload);
        });

        socket.on("UpdatedPrivateMessage", function (payload: any) {
            EmitRelayInfoToRoom('UserUpdates-' + payload.Sender, "UpdatedMessage", payload);
            EmitRelayInfoToRoom('UserUpdates-' + payload.Receiver, "UpdatedMessage", payload);
        });

        socket.on("UpdatedRoomMessage", function (payload: any) {
            EmitRelayInfoToRoom(payload.RoomId, "UpdatedMessage", payload);
        });

        socket.on("UpdateRoomDetails", function (payload: any) {
            EmitRelayInfoToRoom(payload._id, "UpdatedRoom", payload);
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