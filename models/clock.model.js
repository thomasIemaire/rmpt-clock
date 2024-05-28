class Clock {

    #running;
    #levelrunning;
    #levels;

    constructor() {
        this.#running = false;
        this.#levelrunning = 0;
        this.#levels = [];
    }

    addLevel(level) {
        this.#levels.push(level);
    }

    getLevel(index) {
        return this.#levels[index];
    }

    nextLevel() {
        this.#levelrunning++;
        return this.#levels[this.#levelrunning];
    }

    run() {
        this.#running = true;
    }

    stop() {
        this.#running = false;
    }

    isRunning() {
        return this.#running;
    }

}

module.exports = Clock;