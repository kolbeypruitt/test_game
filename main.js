var ready;
var myId;
var currentUsers;
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
    if (currentUsers[id]) {
      currentUsers[id].kill();
      // console.log('killing ', id, currentUsers[id]);
    }
  }

  eurecaClient.exports.spawnEnemy = function(i, x, y) {

    if (i == myId) return; //this is me

    // console.log('SPAWN');
    var spawn = new Avatar(i, game, avatar);
    currentUsers[i] = spawn;
  }

  eurecaClient.exports.updateState = function(id, state) {
    // console.log('updating state', id, state)
    if (currentUsers[id]) {
      currentUsers[id].cursor = state;
      currentUsers[id].avatar.x = state.x;
      currentUsers[id].avatar.y = state.y;
      currentUsers[id].avatar.fire = state.fire;
      currentUsers[id].update();
    }
  }

}

//
//
// everything above this is eureca code
//
//

var game = new Phaser.Game(1200, 800, Phaser.AUTO, 'gamediv', {
  preload: preload,
  create: eurecaClientSetup,
  update: update,
  render: render
});

function preload() {
  game.load.spritesheet('walking', 'assets/marvin/walking.png', 63.5, 65, 36);
  game.load.image('enemy', 'assets/pikachu.png');
  game.load.image('grass', 'assets/grass.png');
  game.load.image('logo', 'assets/game_logo.png');
}


function create() {

  //  Resize our game world to be a 2000 x 2000 square
  game.world.setBounds(-1000, -1000, 2000, 2000);
  game.stage.disableVisibilityChange = true;

  //  Our tiled scrolling background
  land = game.add.tileSprite(0, 0, 1200, 800, 'grass');
  land.fixedToCamera = true;

  currentUsers = {};

  player = new Avatar(myId, game, avatar);
  currentUsers[myId] = player;
  avatar = player.avatar;
  turret = player.turret;
  avatar.x = 0;
  avatar.y = 0;
  shadow = player.shadow;

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

  player.input.left = cursors.left.isDown;
  player.input.right = cursors.right.isDown;
  player.input.up = cursors.up.isDown;
  player.input.down = cursors.down.isDown;
  player.input.fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).isDown;
  player.input.tx = game.input.x + game.camera.x;
  player.input.ty = game.input.y + game.camera.y;

  land.tilePosition.x = -game.camera.x;
  land.tilePosition.y = -game.camera.y;

  for (var i in currentUsers) {
    if (!currentUsers[i]) continue;
    var curAvatar = currentUsers[i].avatar;
    for (var j in currentUsers) {
      if (!currentUsers[j]) continue;
      if (j != i) {
        var targetAvatar = currentUsers[j].avatar;
      }
      if (currentUsers[j].alive) {
        currentUsers[j].update();
      }
    }
  }


  scoreText.text = 'Score: ' + score;

  if (score == 4000) {
    winText.visible = true;
    scoreText.visible = false;
  }

}

function render() {}