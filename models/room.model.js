const Clock = require('./clock.model');
const User = require('./user.model');

class Room {
    #path;
    #users;
    #clock;

    constructor(id) {
        this.#path = `/${id}`;
        this.#users = [];
        this.#clock = new Clock();
    }

    getPath() {
        return this.#path;
    }

    addConnection(ws) {
        const user = new User(ws);
        this.#users.push(user);
        this.setHost();
        this.notifyAllUsers();
    }

    removeConnection(ws) {
        this.#users = this.#users.filter(user => user.getWs() !== ws);
        this.setHost();
        this.notifyAllUsers();
    }

    setHost() {
        if (this.#users.length > 0) 
            this.#users[0].setHost();
    }

    getUsers() {
        return this.#users.map(user => ({
            id: user.getId(),
            isHost: user.isHost(),
        }));
    }

    notifyAllUsers() {
        const userList = this.getUsers();
        this.#users.forEach(user => {
            user.getWs().send(JSON.stringify({ type: 'userList', data: userList }));
        });
    }
}

module.exports = Room;
