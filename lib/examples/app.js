var config      = require('./config'),
    enums       = require('./data/enums'),
    models      = require('./data/models'),
    mongoose    = require('mongoose'),
    seeds       = require('./data/seed');

mongoose.Promise = global.Promise;
mongoose.connect(config.db.uri, config.db.options);
mongoose.connection.on('error', function (err) {
    if (err) { throw err; }
});
mongoose.connection.once('open', function (err) {
    if (err) { throw err; }

    seeds.doSeed(function(err){
        if (err) { return process.exit(1); }

        models.Person.find({}, function(err, people){
            if (err) { throw err; }

            var person = people[0];
            console.log(person.toJSON());

            if (!person.ad) {
                person.delete(function(next, deletedPerson){
                    if (err) { throw err; }

                    console.log(deletedPerson.toJSON());
                });
            }
        });
    });
});
