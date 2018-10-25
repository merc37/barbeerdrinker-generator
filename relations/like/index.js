'use strict';

const Relation = require('../relation');

module.exports = class Like extends Relation {
    constructor(drinker, item) {
        super([drinker.name, item.name]);
        this.drinker = drinker.name;
        this.item = item.name;
    }
};