var runServer = require('../index').runServer;
console.log('test');
before(function(done) {
    runServer(function() {
        done();
    });
});

