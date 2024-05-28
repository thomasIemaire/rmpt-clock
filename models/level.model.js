class Level {

    #id;
    #duration;
    #smallblind;
    #bigblind;

    constructor(id, duration, blinds) {
        this.#id = id;
        this.#duration = duration;
        this.#smallblind = blinds[0];
        this.#bigblind = blinds[1];
    }

    getId() {
        return this.#id;
    }

    getDuration() {
        return this.#duration;
    }

    getSmallBlind() {
        return this.#smallblind;
    }

    getBigBlind() {
        return this.#bigblind;
    }

}

module.exports = Level;