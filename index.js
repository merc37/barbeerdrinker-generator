'use strict';

require('dotenv').config();
const mysql = require('promise-mysql');

const generators = require('./generators');

//Entities
let entityInsertQueries = [];

const drinkers = generators.GenerateDrinkers();
entityInsertQueries = entityInsertQueries.concat(generators.GenerateDrinkersInsertQueries(drinkers));

const items = generators.GenerateItems();
entityInsertQueries = entityInsertQueries.concat(generators.GenerateItemsInsertQueries(items));

const bars = generators.GenerateBars();
entityInsertQueries = entityInsertQueries.concat(generators.GenerateBarsInsertQueries(bars));

//Relations
let relationInsertQueries = [];
const likes = generators.GenerateLikes(drinkers, items);
relationInsertQueries = relationInsertQueries.concat(generators.GenerateLikesInsertQueries(likes));
const hours = generators.GenerateHours(bars);
relationInsertQueries = relationInsertQueries.concat(generators.GenerateHoursInsertQueries(hours));
const sells = generators.GenerateSells(bars, items);
relationInsertQueries = relationInsertQueries.concat(generators.GenerateSellsInsertQueries(sells));
const frequents = generators.GenerateFrequents(drinkers, bars);
relationInsertQueries = relationInsertQueries.concat(generators.GenerateFrequentsInsertQueries(frequents));

//Special cases
const bills = generators.GenerateBills(hours, sells);
entityInsertQueries = entityInsertQueries.concat(generators.GenerateBillsInsertQueries(bills));
const billsIssued = generators.GenerateBillsIssued(bills);
relationInsertQueries = relationInsertQueries.concat(generators.GenerateBillsIssuedInsertQueries(billsIssued));
const billsOwed = generators.GenerateBillsOwed(bills, drinkers);
relationInsertQueries = relationInsertQueries.concat(generators.GenerateBillsOwedInsertQueries(billsOwed));
const itemsPurchased = generators.GenerateItemsPurchased(bills);
relationInsertQueries = relationInsertQueries.concat(generators.GenerateItemsPurchasedInsertQueries(itemsPurchased));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    database: 'BarBeerDrinker',
    connectTimeout: 100000,
});

Promise.all([
    pool.query('DROP TABLE IF EXISTS BillsIssued;'),
    pool.query('DROP TABLE IF EXISTS BillsOwed;'),
    pool.query('DROP TABLE IF EXISTS Frequents;'),
    pool.query('DROP TABLE IF EXISTS ItemsPurchased;'),
    pool.query('DROP TABLE IF EXISTS Sells;'),
    pool.query('DROP TABLE IF EXISTS Hours;'),
    pool.query('DROP TABLE IF EXISTS Likes;'),
]).then(() => {
    return Promise.all([
        pool.query('DROP TABLE IF EXISTS Drinkers;'),
        pool.query('DROP TABLE IF EXISTS Items;'),
        pool.query('DROP TABLE IF EXISTS Bills;'),
        pool.query('DROP TABLE IF EXISTS Bars;'),
    ]).then(() => {
        return Promise.all([
            //entities
            pool.query('CREATE TABLE Drinkers(name varchar(255), city varchar(255), phone varchar(255), address varchar(255), state varchar(255), PRIMARY KEY(name))'),
            pool.query('CREATE TABLE Items(name varchar(255), manufacturer varchar(255), type varchar(255) NOT NULL, PRIMARY KEY(name))'),
            pool.query('CREATE TABLE Bills(transactionID varchar(255), time BIGINT UNSIGNED, total DECIMAL(9, 2), tip DECIMAL(9, 2), PRIMARY KEY(transactionID))'),
            pool.query('CREATE TABLE Bars(name varchar(255), city varchar(255), phone varchar(255), address varchar(255), license varchar(255), state varchar(255), PRIMARY KEY(name))'),
        ]).then(() => {
            return Promise.all([
                //relations
                pool.query('CREATE TABLE Likes(drinker varchar(255), item varchar(255), FOREIGN KEY(drinker) REFERENCES Drinkers(name), FOREIGN KEY(item) REFERENCES Items(name))'),
                pool.query('CREATE TABLE BillsIssued(bill varchar(255), bar varchar(255), FOREIGN KEY(bill) REFERENCES Bills(transactionID), FOREIGN KEY(bar) REFERENCES Bars(name))'),
                pool.query('CREATE TABLE BillsOwed(bill varchar(255), drinker varchar(255), FOREIGN KEY(bill) REFERENCES Bills(transactionID), FOREIGN KEY(drinker) REFERENCES Drinkers(name))'),
                pool.query('CREATE TABLE Frequents(drinker varchar(255), bar varchar(255), FOREIGN KEY(bar) REFERENCES Bars(name), FOREIGN KEY(drinker) REFERENCES Drinkers(name))'),
                pool.query('CREATE TABLE ItemsPurchased(bill varchar(255), item varchar(255), quantity TINYINT(2), FOREIGN KEY(bill) REFERENCES Bills(transactionID), FOREIGN KEY(item) REFERENCES Items(name))'),
                pool.query('CREATE TABLE Sells(item varchar(255), bar varchar(255), price DECIMAL(9, 2), FOREIGN KEY(item) REFERENCES Items(name), FOREIGN KEY(bar) REFERENCES Bars(name))'),
                pool.query('CREATE TABLE Hours(bar varchar(255), day varchar(255), open TINYINT(2), close TINYINT(2), FOREIGN KEY(bar) REFERENCES Bars(name))'),
            ]).then(() => {
                entityInsertQueries = entityInsertQueries.map(insertQuery => {
                    return pool.query(insertQuery);
                });
                return Promise.all(entityInsertQueries).then(() => {
                    relationInsertQueries = relationInsertQueries.map(insertQuery => {
                        return pool.query(insertQuery);
                    });
                    return Promise.all(relationInsertQueries).then(() => {
                        console.log('DATABASE GENERATED');
                        pool.end();
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
}).catch((err) => {
    console.log(err);
    pool.end();
});