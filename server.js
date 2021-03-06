var express = require('express'),
  app = express(app),
  server = require('http').createServer(app),
  cors = require('cors');

// serve static files from the current directory
app.use(express.static(__dirname));

app.use(cors());

//we'll keep clients data here
var clients = {};

//get EurecaServer class
var Eureca = require('eureca.io');


//create an instance of EurecaServer
var eurecaServer = new Eureca.Server({
  allow: ['setId', 'spawnEnemy', 'kill', 'updateState', 'tchat.welcome', 'tchat.send']
});

//attach eureca.io to our http server
eurecaServer.attach(server);

//eureca.io provides events to detect clients connect/disconnect

//detect client connection
eurecaServer.onConnect(function(conn) {
  console.log('New Client id=%s ', conn.id, conn.remoteAddress);

  //the getClient method provide a proxy allowing us to call remote client functions
  var remote = eurecaServer.getClient(conn.id);

  //register the client
  clients[conn.id] = {
    id: conn.id,
    remote: remote,
    nick: null,
    client: eurecaServer.getClient(conn.id)
  }

  //here we call setId (defined in the client side)
  remote.setId(conn.id);
});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {    
    console.log('Client disconnected ', conn.id);
  
  var removeId = clients[conn.id].id;
  
  delete clients[conn.id];
  
  for (var c in clients)
  {
    var remote = clients[c].remote;
    
    //here we call kill() method defined in the client side
    remote.kill(conn.id);
  } 
});


//a namespace for chat methods on the server side
var tchatServer = eurecaServer.exports.tchatServer = {};

//simulate authentication, this can be a login/password check but for this tutorial
//we just check for non empty nick
tchatServer.login = function(nick) {
  console.log('Client %s auth with %s', this.connection.id, nick);
  var id = this.connection.id;
  if (nick !== undefined) //here we can check for login/password validity for example
  {
    clients[id].nick = nick;
    clients[id].client.tchat.welcome();
  }
}

//clients will call this method to send messages
tchatServer.send = function(message) {
    var sender = clients[this.connection.id];
    for (var c in clients) // just loop and send message to all connected clients
    {
      if (clients[c].nick) //simulate authentication check
        clients[c].client.tchat.send(sender.nick, message);
    }
  }
  //------------------------------------------



eurecaServer.exports.handshake = function() {
  console.log("shaking hands...")
  for (var c in clients) {
    var remote = clients[c].remote;
    for (var cc in clients) {
      //send latest known position
      var x = clients[cc].laststate ? clients[cc].laststate.x : 0;
      var y = clients[cc].laststate ? clients[cc].laststate.y : 0;

      remote.spawnEnemy(clients[cc].id, x, y);
    }
  }
}


//be exposed to client side
eurecaServer.exports.handleKeys = function(keys) {
  console.log("handling keys...", keys)
  var conn = this.connection;
  var updatedClient = clients[conn.id];

  for (var c in clients) {
    var remote = clients[c].remote;
    remote.updateState(updatedClient.id, keys);

    //keep last known state so we can send it to new connected clients
    clients[c].laststate = keys;
  }
}
server.listen(3000);