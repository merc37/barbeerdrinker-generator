require('dotenv').config();
const mysql = require('promise-mysql');
const faker = require('faker');
const item = require('./entities/item');
let connection;

mysql.createPool();

mysql.createConnection({
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
}).then((conn) => {
    connection = conn;

}).catch((err) => {
    console.log(err);
}).finally(() => {
    if (connection) {
        connection.end();
    }
});

const GenerateItems = () => {
    const itemCount = 100;
    const items = [];
    const types = [
        'beer',
        'item',
    ];
    for (let i = 0; i < itemCount; i++) {
        items.push(new item(faker.commerce.productName(), faker.company.companyName(), types[Math.floor(Math.random() * types.length)]));
    }
    return items;
};