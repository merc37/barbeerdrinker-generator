'use strict';

require('dotenv').config();
const mysql = require('promise-mysql');
const faker = require('faker');

const Drinker = require('./entities/drinker');
const Item = require('./entities/item');
const Like = require('./relations/like');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    database: 'BarBeerDrinker',
});

Promise.all([
    pool.query('SET FOREIGN_KEY_CHECKS=0'),
]).then(() => {
    return Promise.all([
        pool.query('DROP TABLE IF EXISTS drinkers;'),
        pool.query('DROP TABLE IF EXISTS items;'),
        pool.query('DROP TABLE IF EXISTS likes;'),
        pool.query('DROP TABLE IF EXISTS bills;'),
        pool.query('DROP TABLE IF EXISTS days;'),
        pool.query('DROP TABLE IF EXISTS bars;'),
        pool.query('DROP TABLE IF EXISTS bills-issued;'),
        pool.query('DROP TABLE IF EXISTS bills-owed;'),
        pool.query('DROP TABLE IF EXISTS frequents;'),
        pool.query('DROP TABLE IF EXISTS items-purchased;'),
        pool.query('DROP TABLE IF EXISTS sells;'),
    ]).then(() => {
        return Promise.all([
            //entities
            pool.query('CREATE TABLE drinkers(name varchar(255), city varchar(255), phone varchar(255), address varchar(255), PRIMARY KEY(name))'),
            pool.query('CREATE TABLE items(name varchar(255), manufacturer varchar(255), type varchar(255) NOT NULL, PRIMARY KEY(name))'),
            pool.query('CREATE TABLE bills(transactionID varchar(255), time varchar(255), total varchar(255), tip varchar(255), PRIMARY KEY(transactionID))'),
            pool.query('CREATE TABLE days(day varchar(255), PRIMARY KEY(day))'),
            pool.query('CREATE TABLE bars(name varchar(255), city varchar(255), phone varchar(255), address varchar(255), license varchar(255), PRIMARY KEY(name))'),
         
            //relations
           
            pool.query('CREATE TABLE likes(drinker varchar(255), item varchar(255), FOREIGN KEY(drinker) REFERENCES drinkers(name), FOREIGN KEY(item) REFERENCES items(name))'),
            pool.query('CREATE TABLE bills-issued(bill varchar(255), bar varchar(255), FOREIGN KEY(bill) REFERENCES bills(transactionID), FOREIGN KEY(bar) REFERENCES bars(name)'),
            pool.query('CREATE TABLE bills-owed(bill varchar(255), drinker varchar(255), FOREIGN KEY(bill) REFERENCES bills(transactionID), FOREIGN KEY(drinker) REFERENCES drinkers(name)'),
            pool.query('CREATE TABLE frequents(bar varchar(255), drinker varchar(255), FOREIGN KEY(bar) REFERENCES bars(name), FOREIGN KEY(drinker) REFERENCES drinkers(name))'),
            pool.query('CREATE TABLE items-purchased(bill varchar(255), item varchar(255), quantity varchar(255), FOREIGN KEY(bill) REFERENCES bills(transactionID), FOREIGN KEY(item) REFERENCES items(name))'),
            pool.query('CREATE TABLE sells(item varchar(255), bar varchar(255), price varchar(255), FOREIGN KEY(item) REFERENCES items(name), FOREIGN KEY(bar) REFERENCES bars(name)'),


        ]).then(() => {
            let insertQueries = [];
            const items = GenerateItems();
            insertQueries = insertQueries.concat(GenerateItemsInsertQueries(items));
            const drinkers = GenerateDrinkers();
            insertQueries = insertQueries.concat(GenerateDrinkersInsertQueries(drinkers));
            return Promise.all(insertQueries.map(insertQuery => {
                return pool.query(insertQuery);
            })).then(() => {
                //Fill in relations here
                return Promise.all([
                    pool.query('SET FOREIGN_KEY_CHECKS=1'),
                ]).then(() => {
                    pool.end()
                }).catch((err) => {
                    console.log(err);
                    pool.end();
                });
            }).catch((err) => {
                console.log(err);
                pool.end();
            });
        }).catch((err) => {
            console.log(err);
            pool.end();
        });
    }).catch((err) => {
        console.log(err);
        pool.end();
    });
}).catch((err) => {
    console.log(err);
    pool.end();
});

//This can be drastically improved by removing entity/relation specific data back to the class they came from
const GenerateDrinkers = () => {
    const drinkers = [];
    const count = 100;

    let name;
    let city;
    let phone;
    let address;

    let used = new Set();
    for (let i = 0; i < count; i++) {
        do {
            name = faker.name.firstName() + ' ' + faker.name.lastName();
        } while (used.has(name));
        used.add(name);
        city = faker.address.city();
        phone = faker.phone.phoneNumber();
        address = faker.address.streetAddress();
        drinkers.push(new Drinker(name, city, phone, address));
    }
    return drinkers;
};

const GenerateDrinkersInsertQueries = (drinkers) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO items VALUES ';
    let values;
    drinkers.forEach(drinker => {
        values = '("' + drinker.name + '","' + drinker.city + '","' + drinker.phone + '","' + drinker.address + '"),';
        if ((insertQuery.length + values.length) > 2800) {
            insertQueries.push(insertQuery.slice(0, -1));
            insertQuery = 'INSERT INTO items VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1));
    return insertQueries;
};

const GenerateItems = () => {
    const items = [];
    const count = 100;
    const types = [
        'beer',
        'item',
    ];
    let name;
    let manufacturer;
    let type;

    let used = new Set();
    for (let i = 0; i < count; i++) {
        do {
            name = faker.commerce.productName();
        } while (used.has(name));
        used.add(name);
        manufacturer = faker.company.companyName();
        type = types[Math.floor(Math.random() * types.length)];
        items.push(new Item(name, manufacturer, type));
    }
    return items;
};

const GenerateItemsInsertQueries = (items) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO items VALUES ';
    let values;
    items.forEach(item => {
        values = '("' + item.name + '","' + item.manufacturer + '","' + item.type + '"),';
        if ((insertQuery.length + values.length) > 2800) {
            insertQueries.push(insertQuery.slice(0, -1));
            insertQuery = 'INSERT INTO items VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1));
    return insertQueries;
};