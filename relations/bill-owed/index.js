'use strict';

const Relation = require('../relation');

module.exports = class BillOwed extends Relation {
    constructor(bill, drinker) {
        super([bill.transactionID, drinker.name]);
        this.bill = bill;
        this.drinker = drinker;
    }
};