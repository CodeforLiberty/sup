var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('./models/user');


var app = express();

var jsonParser = bodyParser.json();

// Add your API endpoints here

app.get('/users', function (req, res) {
    User.find(function (err, dbitems) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Internal Server Error'
            })
        }
        res.json(dbitems);
    })
})

app.get('/users/:id', function (req,res) {
    console.log(req.params.id)

    User.findById(req.params.id, function(err, dbitem) {
        if(dbitem===null) {
            console.log(err);
            return res.status(404).json({message:'User not found'})
        }
         res.json(dbitem);
    })
})

app.post('/users', jsonParser, function (req, res) {
    if (!req.body)  {
        return res.status(400).json({
            message: 'No request body'
        })
    }
    if(!req.body.username) { 
        return res.status(422).json({
            message: 'Missing field: username'
        })
    }
    if(typeof req.body.username!='string') {
        return res.status(422).json({
            message: 'Incorrect field type: username'
        })
    }
    var user = new User({username: req.body.username});

    user.save().then(function(user) {
        res.location('/users/' + user._id).status(201).json({})
        .catch(function(err) {
            console.log(err); 
            return res.status(500).send({
              message: 'Internal Server Error'
            })
        }) 
    })
})


app.put('/users/:id', jsonParser, function (req,res) {
    if(!req.body.username) {
        return res.status(422).json({
            message: "Missing field: username"
        })
    }
    if (typeof req.body.username !== 'string') {
         return res.status(422).json({
            message: "Incorrect field type: username"
        })
    }

    User.findOneAndUpdate({_id: req.params.id}, {username: req.body.username}, function(err, dbitem) {
        if (err) {
          return res.status(400).json({
            message: 'Internal Server Error'
          })
        }
        else if (dbitem === null) {
           var user = new User({username: req.body.username, _id: req.body._id});
                user.save().then(function(user) {
                return res.location('/users/' + user._id).status(200).json({})
                }).catch(function(err) {
                    console.log(err); 
                    return res.status(500).send({
                        message: 'Internal Server Error'
                    })
                }) 
            }
        else {
            return res.status(200).json({});
        }
    }) 
})

app.delete('/users/:id', jsonParser, function(req, res) {
    User.findById(req.params.id, function (err, dbitem) {
        if (dbitem === null) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        dbitem.remove(function(err) {
            if(err) {
                console.log(err); 
                return res.status(500).json({
                    message: "Internal Server Error"
                });
            }
            return res.status(200).json({})
        })
    })
})

var runServer = function(callback) {
    var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://user:user@ds161487.mlab.com:61487/sup-app';
    mongoose.connect(databaseUri).then(function() {
        console.log('connected');
        var port = process.env.PORT || 8080;
        var server = app.listen(port, function() {
            console.log('Listening on port ' + port);
            if (callback) {
                callback(server);
            }
        });
    });
};

if (require.main === module) {
    runServer();
};

exports.app = app;
exports.runServer = runServer;


