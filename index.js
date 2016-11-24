var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('./models/user');
var Messages = require('./models/message')

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
        return res.json(dbitems);
    });
});

app.get('/users/:id', function (req,res) {
    

    User.findById(req.params.id, function(err, dbitem) {
        
        if(dbitem===null) {
        
            return res.status(404).json({message:'User not found'})
        }
         
        return res.json(dbitem);
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
             
            return res.status(500).send({
              message: 'Internal Server Error'
            })
        }) 
    })
})


app.put('/users/:id', jsonParser, function (req,res) {
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

app.delete('/users/:id', jsonParser, function (req,res) {
User.findOneAndRemove({_id:req.params.id},function(err,user){
    if(!user) {
       return res.status(404).json({message:'User not found'});
    }
    return res.status(200).json({});

    })   
})

app.get('/messages', function(req, res) {
    var filter = {};
    if ('to' in req.query) {
        filter.to = req.query.to;
    }
    if ('from' in req.query) {
        filter.from = req.query.from;
    }
    Messages.find(filter) 
        .populate('from to')
        .then(function(messages) {
            res.json(messages);
        });
}); 


// app.get('/messages', jsonParser, function (req, res){
//     var state = {username: ""};
//     var query = {};
//     if (req.query.to !== undefined) {
//         query.to = req.query.to;
//     }
//     if (req.query.from !== undefined) {
//         query.from = req.query.from;
//     }

//      Messages.find(query).populate('from to').exec(function(err, messages) {
//         if (err){
//             res.status(500).json({message: 'server error'});
//         }
//         var userMessages = []
//         if (messages.length > 0) {
//             for (var i = 0; i < messages.length; i++) {
//                 if (messages[i].from.username === state.username) {
//                     userMessages.push(messages[i]);
//                 }
//             }
//             return res.status(200).json(userMessages);
//         }
//         res.status(200).json(messages);
//     });
//         // console.log(messages)
//         // res.status(200).json(messages);
        
//     });

    // console.log(req.query.from.length, req.query.to);
    // if(req.query.from !== undefined && req.query.to !== undefined) {
    //     Messages.find({from:req.query.from, to: req.query.to})
    //     .populate('from') 
    //     .populate('to')
    //     .then(function(messages) {
    //     return res.status(200).json(messages);
    //     // req.query.from===true && req.query.to===true
    //   })
    // } else if( req.query.to !== undefined) {
    //     Messages.find({to:req.query.to})
    //     .populate('from')
    //     .populate('to')
    //     .then(function(messages) {
       
    //     return res.status(200).json(messages);
        
    // });
    // } else if(req.query.from !== undefined) {
    //     Messages.find({from:req.query.from})
    //     .populate('from')
    //     .populate('to')
    //     .then(function(messages) {
       
    //     return res.status(200).json(messages);
        
    // });
    // }
    //  Messages.find()
    // .populate('from')
    // .populate('to')
    // .then(function(messages) {
    //     // console.log(messages)
    //     res.status(200).json(messages);
        
    // });
   
    
// })

app.post('/messages', jsonParser, function (req, res){
    if (!req.body.text){
        return res.status(422).json({message: 'Missing field: text'})
    }

    if (typeof req.body.text !== 'string'){
        return res.status(422).json({message: 'Incorrect field type: text'})
     }
    if (typeof req.body.to !== 'string'){
        return res.status(422).json({message: 'Incorrect field type: to'})
     }
     if (typeof req.body.from !== 'string'){
        return res.status(422).json({message: 'Incorrect field type: from'})
     }

      var message = new Messages(req.body);

      var findFrom = User.findOne({
        _id: message.from
      });

      var findTo = User.findOne({
        _id: message.to
      });

      return Promise.all([findFrom, findTo]).then(function(results){
        console.log(results);
        if (!results[0]){
            return res.status(422).json({message: 'Incorrect field value: from'})
            
        }
        else if (!results[1]){
            return res.status(422).json({message: 'Incorrect field value: to'})
            // return null;
        }
        else{
            message.save()
            return res.location('/messages/' + message._id).status(201).json({})
        }
      }).catch(function(err){
            res.status(500).send({message: 'Internal server error'});
         });
 });

app.post('/messages/:messageId', jsonParser, function(req, res){

})

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


