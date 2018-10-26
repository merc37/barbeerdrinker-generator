'use strict';

const Relation = require('../relation');

module.exports = class Hour extends Relation {
    constructor(day, bar, open, close) {
        super([bar.name]);
        this.day = day;
        this.bar = bar;
        this.open = open;
        this.close = close;
    }
};