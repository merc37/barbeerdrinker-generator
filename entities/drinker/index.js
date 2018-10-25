'use strict';

const Entity = require('../entity');

module.exports = class Drinker extends Entity {
    constructor(name, city, phone, address, state) {
        super(name);
        this.name = name;
        this.city = city;
        this.phone = phone;
        this.address = address;
        this.state = state;
    }
};