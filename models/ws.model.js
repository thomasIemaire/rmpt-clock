const Room = require('./room.model');

class Ws {
    #rooms;

    constructor() {
        this.#rooms = {};
    }

    createRoom(roomId) {
        const room = new Room(roomId);
        this.#rooms[roomId] = room;
        return room;
    }

    getRoom(roomId) {
        return this.#rooms[roomId];
    }

    addConnectionInRoom(roomId, ws) {
        let room = this.getRoom(roomId);
        if (!room) {
            room = this.createRoom(roomId);
        }
        room.addConnection(ws);
    }

    removeConnectionInRoom(roomId, ws) {
        const room = this.getRoom(roomId);
        if (room) {
            room.removeConnection(ws);
        }
    }
}

module.exports = Ws;
