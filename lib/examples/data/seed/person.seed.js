var models = require('../models');

var items = [
    {
        s:  '123456789',

        f:  'Joe',
        m:  'Dweezil',
        l:  'Blow',

        bm: 1,
        bd: 23,
        by: 2000
    },
    {
        s:  '987654321',

        f:  'Michael',
        m:  'Weenis',
        l:  'Hunt',

        bm: 12,
        bd: 31,
        by: 1969
    }
];

var doSeed = function (done) {
    if (items.length < 1) {
        console.log('Seeding Persons... no seeds.');
        return done();
    }
    models.Person.find({}, function (err, existing) {
        if (err) { throw err; }
        if (existing.length > 0) {
            console.log('Seeding Persons... skipped.');
            return done();
        }
        models.Person.insertMany(items, function (err, docs) {
            if (err) {
                console.log('Seeding Persons... ERROR!');
                for (var e in (err.errors || [])) {
                    if (e) { console.log(JSON.stringify(e)); }
                }
                return done(err);
            }
            console.log('Seeding Persons... ' + docs.length + ' added.');

            return done();
        });
    });
};

module.exports = {
    doSeed  : doSeed
};
