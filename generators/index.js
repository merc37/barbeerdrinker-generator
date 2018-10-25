const faker = require('faker');

const Bar = require('./entities/bar');
const Drinker = require('./entities/drinker');
const Item = require('./entities/item');
const Like = require('./relations/like');
const Frequent = require('./relations/frequent');

//This can be drastically improved by removing entity/relation specific data back to the class they came from
const getRandomInt = (max, min) => {
    min = min || 0;
    if (min < 0) {
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const GenerateBars = () => {
    const bars = [];
    const count = 100;

    let name;
    let city;
    let phone;
    let address;
    let license;
    let state;

    let used = new Set();
    for (let i = 0; i < count; i++) {
        do {
            name = faker.name.firstName() + ' ' + faker.name.lastName();
        } while (used.has(name));
        used.add(name);
        city = faker.address.city();
        phone = faker.phone.phoneNumberFormat(0);
        address = faker.address.streetAddress();
        let temp = faker.address.stateAbbr();
        license = temp + faker.random.number({
            min: 10000,
            max: 99999,
        });
        state = temp;
        bars.push(new Bar(name, city, phone, address, license, state));
    }
    return bars;
};

const GenerateBarsInsertQueries = (bars) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO Bars VALUES ';
    let values;
    bars.forEach(bars => {
        values = '("' + bars.name + '","' + bars.city + '","' + bars.phone + '","' + bars.address + '", "' + bars.license + '", "' + bars.state + '"),';
        if ((insertQuery.length + values.length) > 2800) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO Bars VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;

};

const GenerateDrinkers = () => {
    const drinkers = [];
    const count = 100;

    let name;
    let city;
    let phone;
    let address;
    let state;

    let used = new Set();
    for (let i = 0; i < count; i++) {
        do {
            name = faker.name.firstName() + ' ' + faker.name.lastName();
        } while (used.has(name));
        used.add(name);
        city = faker.address.city();
        phone = faker.phone.phoneNumberFormat(0);
        address = faker.address.streetAddress();
        state = faker.address.stateAbbr();
        drinkers.push(new Drinker(name, city, phone, address, state));
    }
    return drinkers;
};

const GenerateDrinkersInsertQueries = (drinkers) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO Drinkers VALUES ';
    let values;
    drinkers.forEach(drinker => {
        values = '("' + drinker.name + '","' + drinker.city + '","' + drinker.phone + '","' + drinker.address + '","' + drinker.state + '"),';
        if ((insertQuery.length + values.length) > 2800) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO Drinkers VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
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
    let min;
    let max;
    let used = new Set();
    for (let i = 0; i < count; i++) {
        do {
            name = faker.commerce.productName();
        } while (used.has(name));
        used.add(name);
        manufacturer = faker.company.companyName();
        type = types[Math.floor(Math.random() * types.length)];
        min = i*5;
        max = (i+1)*5;
        items.push(new Item(name, manufacturer, type, min, max));
    }
    return items;
};

const GenerateItemsInsertQueries = (items) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO Items VALUES ';
    let values;
    items.forEach(item => {
        values = '("' + item.name + '","' + item.manufacturer + '","' + item.type + '"),';
        if ((insertQuery.length + values.length) > 2800) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO Items VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;
};

const GenerateLikes = (drinkers, items) => {
    const likes = [];
    const count = getRandomInt(drinkers.length - 1, Math.floor(drinkers.length / 4));
    for (let i = 0; i < count; i++) {
        likes.push(new Like(drinkers[i], items[getRandomInt(items.length - 1)]));
    }
    return likes;
};

const GenerateLikesInsertQueries = (likes) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO Likes VALUES ';
    let values;
    likes.forEach(like => {
        values = '("' + like.drinker + '","' + like.item + '"),';
        if ((insertQuery.length + values.length) > 2800) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO Likes VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;
};

const GenerateFrequents = (drinkers, bars) => {
    const frequents = [];
    const count = Math.floor(Math.random() * drinkers.length);
    for (let i = 0; i < count; i++) {
        let j = Math.floor(Math.random() * bars.length);
        while (drinkers[i].state != bars[j].state) {
            j = Math.floor(Math.random() * bars.length);
        }
        frequents.push(new Frequent(drinkers[i].name, bars[j].name));
    }
    return frequents;
};

const GenerateFrequentsInsertQueries = (frequents) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO frequents VALUES ';
    let values;
    frequents.forEach(frequent => {
        values = '("' + frequents.drinker + '","' + frequents.bar + '"),';
        if ((insertQuery.length + values.length) > 2800) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO frequents VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;
};

const GenerateSells = (bars, items) => {
    const sells = [];
    const count = getRandomInt(bars.length - 1, Math.floor(bars.length / 4));


    for (let i = 0; i < count; i++) {
        let j = getRandomInt(items.length - 1);
        let price = faker.finance.amount(items[j].min, items[j].max, 2);
        sells.push(new Sell(bars[i].name, items[j].name, price));
    }
    return sells;
};

const GenerateSellsInsertQueries = (sells) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO Sells VALUES ';
    let values;
    sells.forEach(sell => {
        values = '("' + sell.bar + '","' + sell.item + '",' + sell.price + '),';
        if ((insertQuery.length + values.length) > 2800) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO Sells VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;
};














module.exports = {
    GenerateBars: GenerateBars,
    GenerateBarsInsertQueries: GenerateBarsInsertQueries,
    GenerateDrinkers: GenerateDrinkers,
    GenerateDrinkersInsertQueries: GenerateDrinkersInsertQueries,
    GenerateItems: GenerateItems,
    GenerateItemsInsertQueries: GenerateItemsInsertQueries,
    GenerateLikes: GenerateLikes,
    GenerateLikesInsertQueries: GenerateLikesInsertQueries,
    GenerateFrequents: GenerateFrequents,
    GenerateFrequentsInsertQueries: GenerateFrequentsInsertQueries,
};