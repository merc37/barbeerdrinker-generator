'use strict';

const Entity = require('../entity');

module.exports = class Beer extends Entity {
    constructor(name, manufacturer, type) {
        super(name);
        this.name = name;
        this.manufacturer = manufacturer;
        this.type = type;
        this.min = min;
        this.max = max;
    }
};