'use strict';

require('dotenv').config({
    path: '../.env',
});
const mysql = require('promise-mysql');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    database: 'BarBeerDrinker',
});

pool.query('SHOW ENGINE INNODB STATUS;').then((result) => {
    console.log(result);
    pool.end();
}).catch((err) => {
    console.log(err);
    pool.end();
});