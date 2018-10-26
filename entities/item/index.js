'use strict';

const Entity = require('../entity');

module.exports = class Item extends Entity {
    constructor(name, manufacturer, type, min, max) {
        super(name);
        this.name = name;
        this.manufacturer = manufacturer;
        this.type = type;
        this.min = min;
        this.max = max;
    }
};