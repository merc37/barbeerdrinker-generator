'use strict';

const Relation = require('../relation');

module.exports = class Hour extends Relation {
    constructor(day, bar, open, close) {
        super([day.name, bar.name]);
        this.open = open;
        this.close = close;
    }
};