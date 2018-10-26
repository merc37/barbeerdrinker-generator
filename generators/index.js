const faker = require('faker');

const Bar = require('../entities/bar');
const Bill = require('../entities/bill');
const Drinker = require('../entities/drinker');
const Item = require('../entities/item');
const Hour = require('../relations/hour');
const Like = require('../relations/like');
const Frequent = require('../relations/frequent');
const Sell = require('../relations/sell');
const BillOwed = require('../relations/bill-owed');
const BillIssued = require('../relations/bill-issued');
const ItemPurchased = require('../relations/item-purchased');

//This can be drastically improved by removing entity/relation specific data back to the class they came from
const getRandomInt = (max, min) => {
    min = min || 0;
    if (min < 0) {
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const GenerateItemsPurchased = (bills) => {
    const itemsPurchased = [];
    let billItems;
    for (let i = 0; i < bills.length; i++) {
        billItems = bills[i].billItems;
        for (let x = 0; x < Object.keys(billItems).length; x++) {
            //NOTE: billItems is object with keys that are names of item, they are not item object like all other cases
            itemsPurchased.push(new ItemPurchased(bills[i], Object.keys(billItems)[x], billItems[Object.keys(billItems)[x]]));
        }
    }
    return itemsPurchased;
};

const GenerateItemsPurchasedInsertQueries = (itemsPurchased) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO ItemsPurchased VALUES ';
    let values;
    itemsPurchased.forEach(itemPurchased => {
        values = '("' + itemPurchased.bill.transactionID + '","' + itemPurchased.item + '",' + itemPurchased.quantity + '),';
        if ((insertQuery.length + values.length) > 3000) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO ItemsPurchased VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;

};

const GenerateBillsIssued = (bills) => {
    const billsIssued = [];
    for (let i = 0; i < bills.length; i++) {
        billsIssued.push(new BillIssued(bills[i], bills[i].bar));
    }
    return billsIssued;
};

const GenerateBillsIssuedInsertQueries = (billsIssued) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO BillsIssued VALUES ';
    let values;
    billsIssued.forEach(billIssued => {
        values = '("' + billIssued.bill.transactionID + '","' + billIssued.bar.name + '"),';
        if ((insertQuery.length + values.length) > 3000) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO BillsIssued VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;

};

const GenerateBillsOwed = (bills, drinkers) => {
    const billsOwed = [];
    let j;
    for (let i = 0; i < bills.length; i++) {
        j = getRandomInt(drinkers.length - 1);
        billsOwed.push(new BillOwed(bills[i], drinkers[j]));
    }
    return billsOwed;
};

const GenerateBillsOwedInsertQueries = (billsOwed) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO BillsOwed VALUES ';
    let values;
    billsOwed.forEach(billOwed => {
        values = '("' + billOwed.bill.transactionID + '","' + billOwed.drinker.name + '"),';
        if ((insertQuery.length + values.length) > 3000) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO BillsOwed VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;

};

const GenerateBills = (hours, sells) => {
    const bills = [];
    const count = 1000;

    let transactionID;
    let time;
    let total = 0;
    let tip;
    let bar;
    let hour;
    let itemCount;
    let barSells;
    let billItems;

    const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];

    let used = new Set();

    for (let i = 0; i < count; i++) {
        do {
            transactionID = faker.random.uuid();
        } while (used.has(transactionID));
        used.add(transactionID);

        time = faker.date.past(3);
        let x = getRandomInt(hours.length - 1);
        hour = hours[x];
        while (hour.day != days[time.getUTCDay()]) {
            x++;
            if (x >= hours.length) {
                x = getRandomInt(hours.length - 1);
            }
            hour = hours[x];
        }

        bar = hour.bar;
        hour = Math.floor(((Math.random() * (hour.close - hour.open)) + hour.open) * 100) / 100;
        time.setUTCHours(Math.floor(hour));
        time.setUTCMinutes((hour - Math.floor(hour)) * 60);
        time = time.valueOf();
        barSells = sells.filter((sell) => {
            return sell.bar == bar;
        });
        billItems = {};
        itemCount = getRandomInt(7, 1);
        for (let i = 0; i < itemCount; i++) {
            x = getRandomInt(barSells.length - 1);
            if (!billItems[barSells[x].item.name]) {
                billItems[barSells[x].item.name] = 1;
            } else {
                billItems[barSells[x].item.name]++;
            }
            total += Number(barSells[x].price);
        }

        billItems[Object.keys(billItems)[getRandomInt(Object.keys(billItems).length - 1)]] += getRandomInt(5);
        billItems[Object.keys(billItems)[getRandomInt(Object.keys(billItems).length - 1)]] += getRandomInt(5);
        total = Math.floor(total * 100) / 100;
        tip = Math.random() < .5 ? 0 : Math.floor(.15 * total * 100) / 100;

        bills.push(new Bill(transactionID, time, total, tip, bar, billItems));
    }

    return bills;
};

const GenerateBillsInsertQueries = (bills) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO Bills VALUES ';
    let values;
    bills.forEach(bill => {
        values = '("' + bill.transactionID + '",' + bill.time + ',' + bill.total + ',' + bill.tip + '),';
        if ((insertQuery.length + values.length) > 3000) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO Bills VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;

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
            name = faker.company.companyName();
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
    bars.forEach(bar => {
        values = '("' + bar.name + '","' + bar.city + '","' + bar.phone + '","' + bar.address + '", "' + bar.license + '", "' + bar.state + '"),';
        if ((insertQuery.length + values.length) > 3000) {
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
        if ((insertQuery.length + values.length) > 3000) {
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
        min = i * 5;
        max = (i + 1) * 5;
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
        if ((insertQuery.length + values.length) > 3000) {
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
        values = '("' + like.drinker.name + '","' + like.item.name + '"),';
        if ((insertQuery.length + values.length) > 3000) {
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
    const count = getRandomInt(drinkers.length - 1, Math.floor(drinkers.length * .75));
    let stateBars;
    for (let i = 0; i < count; i++) {
        stateBars = bars.filter((bar) => {
            return bar.state == drinkers[i].state;
        });
        if (stateBars.length == 0) {
            continue;
        }
        let j = getRandomInt(stateBars.length - 1);
        frequents.push(new Frequent(drinkers[i], bars[j]));
    }
    return frequents;
};

const GenerateFrequentsInsertQueries = (frequents) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO Frequents VALUES ';
    let values;
    frequents.forEach(frequent => {
        values = '("' + frequent.drinker.name + '","' + frequent.bar.name + '"),';
        if ((insertQuery.length + values.length) > 3000) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO Frequents VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;
};

const GenerateHours = (bars) => {
    const hours = [];
    const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];
    bars.forEach((bar) => {
        days.forEach((day) => {
            hours.push(new Hour(day, bar, getRandomInt(17, 12), getRandomInt(12, 0)));
        });
    });

    return hours;
};

const GenerateHoursInsertQueries = (hours) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO Hours VALUES ';
    let values;
    hours.forEach(hour => {
        values = '("' + hour.bar.name + '","' + hour.day + '",' + hour.open + ',' + hour.close + '),';
        if ((insertQuery.length + values.length) > 3000) {
            insertQueries.push(insertQuery.slice(0, -1) + ';');
            insertQuery = 'INSERT INTO Hours VALUES ';
        }
        insertQuery = insertQuery + values;
    });
    insertQueries.push(insertQuery.slice(0, -1) + ';');
    return insertQueries;
};

const GenerateSells = (bars, items) => {
    const sells = [];
    let itemCount;
    let used = new Set();
    let j;
    let price;
    for (let i = 0; i < bars.length; i++) {
        itemCount = getRandomInt(7, 2);
        used.clear();
        for (let x = 0; x < itemCount; x++) {
            j = getRandomInt(items.length - 1);
            while (used.has(j)) {
                j = getRandomInt(items.length - 1);
            }
            used.add(j);
            price = faker.finance.amount(items[j].min, items[j].max, 2);
            sells.push(new Sell(items[j], bars[i], price));
        }
    }
    return sells;
};

const GenerateSellsInsertQueries = (sells) => {
    const insertQueries = [];
    let insertQuery = 'INSERT INTO Sells VALUES ';
    let values;
    sells.forEach(sell => {
        values = '("' + sell.item.name + '","' + sell.bar.name + '",' + sell.price + '),';
        if ((insertQuery.length + values.length) > 3000) {
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
    GenerateBills: GenerateBills,
    GenerateBillsInsertQueries: GenerateBillsInsertQueries,
    GenerateBillsIssued: GenerateBillsIssued,
    GenerateBillsIssuedInsertQueries: GenerateBillsIssuedInsertQueries,
    GenerateBillsOwed: GenerateBillsOwed,
    GenerateBillsOwedInsertQueries: GenerateBillsOwedInsertQueries,
    GenerateDrinkers: GenerateDrinkers,
    GenerateDrinkersInsertQueries: GenerateDrinkersInsertQueries,
    GenerateItems: GenerateItems,
    GenerateItemsInsertQueries: GenerateItemsInsertQueries,
    GenerateLikes: GenerateLikes,
    GenerateLikesInsertQueries: GenerateLikesInsertQueries,
    GenerateFrequents: GenerateFrequents,
    GenerateFrequentsInsertQueries: GenerateFrequentsInsertQueries,
    GenerateHours: GenerateHours,
    GenerateHoursInsertQueries: GenerateHoursInsertQueries,
    GenerateSells: GenerateSells,
    GenerateSellsInsertQueries: GenerateSellsInsertQueries,
    GenerateItemsPurchased: GenerateItemsPurchased,
    GenerateItemsPurchasedInsertQueries: GenerateItemsPurchasedInsertQueries,
};