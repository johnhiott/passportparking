/*
  Passport Parking Programming Challenge
  John Hiott
*/


var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Parse = require('parse').Parse;
var _ = require('underscore');
var async = require('async');

//"constants" for message passing
var CREATE_FACTORY = "createfactory";
var DELETE_FACTORY = "deletefactory";
var CREATE_NODES = "createnodes";
var GENERATE_WORKERS = "generateworkers";
var DELETE_WORKER = "deleteworker";


/*
  Stuff to get parse ready
*/

Parse.initialize("rZfq5l7jSwQuBh5rf7DpHywXAyrusnA5ihdWXvRM", "liqHizsKOACpntq31tLq93FNdJdUi9m5CDu4euOt");

//Objects being used
var Node = Parse.Object.extend("Node");
var Factory = Parse.Object.extend("Factory");
var Worker = Parse.Object.extend("Worker");


/*
  Create a node for a factory and return it
*/
function createFactoryNode(id, name, min, max, workers){
  nodeData = {
    min          : min,
    max          : max,
    type         : "factory",
  };

  node = {
    id           : id,
    text         : name,
    data         : nodeData,
    li_attr      : { class : "factory_node" },
    children     : workers
  };

  return node;
}


/*
  Add a factory to the database
*/
function createFactory(name, min, max){
  var factory = new Factory();

  factory.set("name", name);
  factory.set("min", parseInt(min));
  factory.set("max", parseInt(max));

  factory.save(null, {
    success: function(factory) {
      newNode = createFactoryNode(factory.id, name, min, max);
      io.emit('addnode', newNode);

    },
    error: function(factory, error) {
      console.log(error.message);
    }
  });
}


/*
  Add a worker to the database
*/
function createWorker(value, parent){
  var worker = new Worker();
  worker.set("value", value);
  worker.set("parent", parent);
  worker.save(null, {
    success: function(worker) {

      msg = {
        parent : parent.id,
        node   : {  id   : "worker_" + worker.id,
                    text : value }
      };
      io.emit('addworker', msg);
    },
    error: function(worker, error) {
      console.log(error.message);
    }
  });
}

/*
  Delete a factory
*/
function deleteFactory(id){
  var query = new Parse.Query(Factory);
  query.get(id, {
    success: function(factory) {
      factory.destroy({
        success: function(object) {
          io.emit('deletenode', id);
        },
        error: function(object, error) {
          //Error deleting
        }
      });
    },
    error: function(object, error) {
    }
  });
}


/*
  Build tree and return JSON
*/
function buildTree(sendData){
  var bal = new Object;
  var query = new Parse.Query(Factory);
  var returnData =  {
    id          : "rootnode",
    text        : "Factories",
    data        : { type   : "root" },
    state       : { opened : true }
  };

  var factoryNodes = [];

  query.find({
    success: function(factories) {
      async.each(factories, function(factory, callback) {
        var innerQuery = new Parse.Query(Worker);
        innerQuery.equalTo("parent", factory);
        innerQuery.find({
          success: function(workers) {
            workerNodes = [];
            _.each(workers, function(worker){
              workerData = {
                id    : "worker_" + worker.id,
                text  : worker.get("value")
              };
              workerNodes.push( workerData );
            });

            factoryNode = createFactoryNode(factory.id, factory.get('name'), factory.get('min'), factory.get('max'), workerNodes)
            factoryNodes.push(factoryNode);
            callback();
          }
        });
      }, function(err){
        if( err ) {
          console.log('Error');
        } else {
          returnData["children"] = factoryNodes;
          sendData(returnData);
        }
      });
    },
    error: function(error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });
}


/*
  Generate X (quantity) workers for factory(factoryId)
*/
function generateWorkers(factoryId, quantity){
  console.log(factoryId);
  var query = new Parse.Query(Factory);
  query.get(factoryId, {
    success: function(factory) {
      var query = new Parse.Query(Worker);
      query.equalTo("parent", factory);
      query.find({
        success: function(results) {

          for (var i = 0; i < results.length; i++) {
            worker = results[i];

            worker.destroy({
              success: function(deletedWorker) {
                io.emit('deletenode', 'worker_' + deletedWorker.id);
              },
              error: function(myObject, error) {
                // The delete failed.
                // error is a Parse.Error with an error code and message.
              }
            });
          }
          //create workers
          for ( x=0; x<quantity; x++ ){
            value = Math.floor((Math.random() * factory.get("max")) + factory.get("min"));
            createWorker(value, factory);
          }

        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });

    },
    error: function(object, error) {
    }
  });
}


/*
  Socket.io stuff
*/
io.on('connection', function(socket){
  console.log('a user connected');

  //user is requesting to add a factory
  socket.on(CREATE_FACTORY, function(msg){
    createFactory(msg.name, msg.min, msg.max);
  });

  //user wants to delete factory
  socket.on(DELETE_FACTORY, function(msg){
    deleteFactory(msg);
  });

  //user wants to generate new workers
  socket.on( GENERATE_WORKERS, function(msg){
    generateWorkers(msg.id, msg.quantity);
  });

  //user wants to delete workers
  socket.on( DELETE_WORKER, function(msg){
    generateWorkers(msg);
  });

});

/*
  Server stuff
*/
//for serving 3rd party dependencies
app.use("/", express.static(__dirname + '/node_modules'));
app.use("/", express.static(__dirname  ));

app.get('/', function(req, res){
  res.sendFile('index.html', {"root": __dirname});
});

app.get('/data', function(req, res) {
  sendData = function(data){
    res.send(data);
  };
  buildTree(sendData);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
