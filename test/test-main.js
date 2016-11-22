var runServer = require('../index').runServer;
console.log('test');
before(function(done) {
	this.timeout(5000)
    runServer(function() {
        done();
    });
});

