'use strict';

const Entity = require('../entity');

module.exports = class Bill extends Entity {
    constructor(transactionID, time, total, tip) {
        super(transactionID);
        this.transactionID = transactionID;
        this.time = time;
        this.total = total;
        this.tip = tip;
    }
};