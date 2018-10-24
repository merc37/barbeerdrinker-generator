'use strict';

const Relation = require('../relation');

module.exports = class ItemPurchased extends Relation {
    constructor(bill, item, quantity) {
        super([bill.transactionID, item.name]);
        this.quantity = quantity;
    }
};