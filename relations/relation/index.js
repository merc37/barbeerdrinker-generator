'use strict';

module.exports = class Relation {
    constructor(foreignKeys) {
        this.foreignKeys = foreignKeys;
    }

    get foreignKeys() {
        return this.foreignKeys;
    }
};