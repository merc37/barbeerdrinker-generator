'use strict';

const Relation = require('../relation');

module.exports = class Like extends Relation {
    constructor(drinker, item) {
        super([drinker.transactionID, item.name]);
    }
};