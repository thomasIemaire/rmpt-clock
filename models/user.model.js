const { v4: uuidv4 } = require('uuid');

class User {
    #ws;
    #isHost;
    #id;

    constructor(ws) {
        this.#ws = ws;
        this.#isHost = false;
        this.#id = uuidv4();
    }

    getWs() {
        return this.#ws;
    }

    getId() {
        return this.#id;
    }

    isHost() {
        return this.#isHost;
    }

    setHost() {
        this.#isHost = true;
    }

    removeHost() {
        this.#isHost = false;
    }
}

module.exports = User;
