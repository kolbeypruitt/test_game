var myId;
var playerList;
var avatar;
var eurecaServer;
var myId = 0;
var land;
var player;
var cursors;
var ready = false;
var enemies;
var score = 0;
var scoreText;

var eurecaClientSetup = function() {
  //create an instance of eureca.io client
  var eurecaClient = new Eureca.Client();

  eurecaClient.ready(function(proxy) {
    eurecaServer = proxy;
  });


  //methods defined under "exports" namespace become available in the server side

  eurecaClient.exports.setId = function(id) {
    //create() is moved here to make sure nothing is created before uniq id assignation
    myId = id;
    create();
    eurecaServer.handshake();
    ready = true;
  }

  eurecaClient.exports.kill = function(id) {
    if (playerList[id]) {
      playerList[id].kill();
      console.log('killing ', id, playerList[id]);
    }
  }

  eurecaClient.exports.spawnEnemy = function(i, x, y) {

    if (i == myId) return; //this is me

    // console.log('SPAWN');
    var spawn = new Player(i, game, avatar);
    playerList[i] = spawn;
    console.log(spawn);
  }

  eurecaClient.exports.updateState = function(id, state) {
    // console.log('updating state', id, state)
    if (playerList[id]) {
      playerList[id].cursor = state;
      playerList[id].avatar.x = state.x;
      playerList[id].avatar.y = state.y;
      playerList[id].avatar.attack = state.attack;
      playerList[id].update();
    }

  }

  eurecaClient.ready(function(proxy) {
    eurecaClient = proxy;
  });

//////// V V V V V V V CHAT STUFF V V V V V V V V V
  var tchat = eurecaClient.exports.tchat = {};
  //the server use this method to send other eurecaClient messages to the current eurecaClient
  tchat.send = function(nick, message) {
    var tchatline = $('<li><b>' + nick + ' </b><span>' + message + '</span></li>');
    $('#msgbox').append(tchatline);
  }

  //called when the server authenticate this eurecaClient
  tchat.welcome = function() {
    $('#auth').fadeOut('fast', function() {
      $('#main').fadeIn('fast');
    });
  }

  //DOM stuff
  //initialise with a default nick
  $('#nick').val('anonymous-' + new Date().getTime());

  //simulate authentication
  $('#logBtn').click(function() {
    console.log('click');
    if (!eurecaClient) return; //eurecaClient not ready

    var nick = $('#nick').val();
    eurecaClient.tchatServer.login(nick);
  });

  //send tchat message
  $('#sendBtn').click(function() {
    if (!eurecaClient) return; //eurecaClient not ready

    eurecaClient.tchatServer.send($('#msg').val());
  });

}

//
//
// everything above this is eureca code
//
//

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gamediv', {
  preload: preload,
  create: eurecaClientSetup,
  update: update,
  render: render
});

function preload() {

  game.load.atlasJSONHash('marvin', 'assets/sprites/marvin.png', 'assets/sprites/marvin.json');
  game.load.image('grass', 'assets/sprites/grass.png');
  game.load.image('logo', 'assets/sprites/game_logo.png');

}


function create() {

  //  Resize our game world to be a 2000 x 2000 square
  game.world.setBounds(-1000, -1000, 2000, 2000);
  game.stage.disableVisibilityChange = true;

  //  Our tiled scrolling background
  land = game.add.tileSprite(0, 0, 800, 600, 'grass');
  land.fixedToCamera = true;

  playerList = {};

  player = new Player(myId, game, avatar);
  playerList[myId] = player;
  avatar = player.avatar;
  avatar.x = 0;
  avatar.y = 0;

  avatar.bringToTop();

  logo = game.add.sprite(150, 200, 'logo');
  logo.fixedToCamera = true;

  game.input.onDown.add(removeLogo, this);

  game.camera.follow(avatar);
  game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
  game.camera.focusOnXY(0, 0);

  cursors = game.input.keyboard.createCursorKeys();

  setTimeout(removeLogo, 2000);


  scoreText = game.add.text(10, 550, 'Score:', {
    font: '32px Arial',
    fill: '#fff'
  });
  scoreText.fixedToCamera = true;
}

function removeLogo() {
  game.input.onDown.remove(removeLogo, this);
  logo.kill();
}

function update() {
  //do not update if client not ready
  if (!ready) return;


  // 

  /* Divide the current tap x coordinate to half the game.width, floor it and there you go */
  // var RIGHT = 0, LEFT = 1;
  // game.input.onTap.add(function(e){
  //   if (Math.floor(e.x/(this.game.width/2)) === LEFT) {
  //     player.input.right = true;
  //     player.input.left = false;
  //   }

  //   if (Math.floor(e.x/(this.game.width/2)) === RIGHT) {
  //     player.input.left = true;
  //     player.input.right = false;
  //   }
  // }); 
  // 

  player.input.left = cursors.left.isDown;
  player.input.right = cursors.right.isDown;
  player.input.up = cursors.up.isDown;
  player.input.down = cursors.down.isDown;
  player.input.attack = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).isDown;

  land.tilePosition.x = -game.camera.x;
  land.tilePosition.y = -game.camera.y;

  for (var i in playerList) {
    if (!playerList[i]) continue;
    var curAvatar = playerList[i].avatar;
    for (var j in playerList) {
      if (!playerList[j]) continue;
      if (j != i && playerList[i].cursor.attack && curAvatar.alive) {

        var targetAvatar = playerList[j].avatar;

        game.physics.arcade.overlap(avatar, targetAvatar, attackHitPlayer, null, this);

      }
      if (playerList[j].alive) {
        playerList[j].update();
      }
    }
  }


  scoreText.text = 'Score: ' + score;

  if (score == 4000) {
    winText.visible = true;
    scoreText.visible = false;
  }

}

function attackHitPlayer(avatar, targetAvatar) {
  targetAvatar.kill();
}

function render() {}