'use strict';

const Entity = require('../entity');

module.exports = class Bar extends Entity {
    constructor(name, city, phone, address, license, state) {
        super(name);
        this.name = name;
        this.city = city;
        this.phone = phone;
        this.address = address;
        this.license = license;
        this.state = state;
    }
};