var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('./models/user');


var app = express();

var jsonParser = bodyParser.json();

// Add your API endpoints here

    //are we sending this to a database, if so, config.js

app.get('/users', function (req, res) {
    User.find(function (err, dbitems) {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.json(dbitems);
    });
});

app.get('/users/:id', function (req,res) {
    console.log(req.params.id)

    User.findById(req.params.id, function(err, dbitem) {
        console.log("hi");
        console.log(dbitem);
        if(dbitem===null) {
            console.log(err);
            return res.status(404).json({message:'User not found'})
        }
         console.log(dbitem);
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
    User.findOneAndUpdate({_id: req.params.id}, {username: req.body.username}, function(err, dbitem) {
        if (err) {
          return res.status(400).json({
            message: 'Internal Server Error'
          });
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
    }); 
})

// app.put('/users/:id', jsonParser, function (req, res) {
//     console.log(req.params._id);
//     User.findById(req.params.id, function (err, dbitem) {
//         console.log("HEY")
//         if (dbitem === null) {
     
//         }
//     })
// })
//     User.create({username: req.body.username}, function(err, dbitem) {
//         if (err) {
//             console.log(err)
//              return res.status(500).json({
//                 message: 'Internal Server Error'
//             });
//         }
//         res.status(201).json(dbitem);
//     });
// });

// app.post('/items', function(req, res) {
//     Item.create({
//         name: req.body.name
//     }, function(err, item) {
//         if (err) {
//             return res.status(500).json({
//                 message: 'Internal Server Error'
//             });
//         }
//         res.status(201).json(item);
//     }); 
// });



//.get, .post, .pull, delete
    // load in parsers
    //made need to look back at mongoose or express documentation in order to lead you in the right direction

//post Model.save (create a new object and save it to the database)
//import or require in the user object

// app.post ('/something', function (req, res) {
//   //create a new instance of a Mongoose model and save it to Mongo
//   //  
// })
//USERS endpoints

    //GET - read
        // Get an array of all users of Sup.
            // /users
        // Get a single user
            // /users/:userId

    //PUT - update
        //Add or edit a Sup user.
            // /users/:userId

    //POST - create
        //// Add a user to Sup
            // /users/:userId

    //DELETE - delete
        //Delete a sup user
            ///users/:userId

//MESSAGES endpoints

    // GET
        //Endpoint representing all the messages in sup, returns an array
            // /messages
        //Get a singular message
            // /messages/:messageId

    //PUT
        

    //POST
        //Adds a message
            // /messages

    //DELETE




var runServer = function(callback) {
    var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://dev:dev@ds161497.mlab.com:61497/sup-app';
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


