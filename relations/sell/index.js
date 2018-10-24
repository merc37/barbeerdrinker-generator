'use strict';

const Relation = require('../relation');

module.exports = class Sell extends Relation {
    constructor(item, bar, price) {
        super([item.name, bar.name]);
        this.price = price;
    }
};