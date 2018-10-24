'use strict';

const Relation = require('../relation');

module.exports = class Frequent extends Relation {
    constructor(drinker, bar) {
        super([drinker.name, bar.name]);
    }
};