'use strict';

const Entity = require('../entity');

module.exports = class Bill extends Entity {
    constructor(transactionID, time, total, tip, bar, billItems) {
        super(transactionID);
        this.transactionID = transactionID;
        this.time = time;
        this.total = total;
        this.tip = tip;
        this.bar = bar;
        this.billItems = billItems;
    }
};