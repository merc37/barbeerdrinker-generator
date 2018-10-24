'use strict';

const Relation = require('../relation');

module.exports = class BillIssued extends Relation {
    constructor(bill, bar) {
        super([bill.transactionID, bar.name]);
    }
};