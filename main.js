var ready;
var myId;
var avatarList;
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
    if (avatarList[id]) {
      avatarList[id].kill();
      // console.log('killing ', id, avatarList[id]);
    }
  }

  eurecaClient.exports.spawnEnemy = function(i, x, y) {

    if (i == myId) return; //this is me

    // console.log('SPAWN');
    var spawn = new Avatar(i, game, avatar);
    avatarList[i] = spawn;
  }

  eurecaClient.exports.updateState = function(id, state) {
    // console.log('updating state', id, state)
    if (avatarList[id]) {
      avatarList[id].cursor = state;
      avatarList[id].avatar.x = state.x;
      avatarList[id].avatar.y = state.y;
      avatarList[id].avatar.attack = state.attack;
      avatarList[id].update();
    }
  }

}

//
//
// everything above this is eureca code
//
//

var game = new Phaser.Game(1200, 700, Phaser.AUTO, 'gamediv', {
  preload: preload,
  create: eurecaClientSetup,
  update: update,
  render: render
});

function preload() {
  game.load.spritesheet('walking', 'assets/marvin/walking.png', 64, 75, 56);
  game.load.image('enemy', 'assets/pikachu.png');
  game.load.image('grass', 'assets/grass.png');
  game.load.image('logo', 'assets/game_logo.png');
}


function create() {

  //  Resize our game world to be a 2000 x 2000 square
  game.world.setBounds(-1000, -1000, 2000, 2000);
  game.stage.disableVisibilityChange = true;

  //  Our tiled scrolling background
  land = game.add.tileSprite(0, 0, 1200, 700, 'grass');
  land.fixedToCamera = true;

  avatarList = {};

  player = new Avatar(myId, game, avatar);
  avatarList[myId] = player;
  avatar = player.avatar;
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
  player.input.attack = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).isDown;

  land.tilePosition.x = -game.camera.x;
  land.tilePosition.y = -game.camera.y;

  for (var i in avatarList) {
    if (!avatarList[i]) continue;
    var curAvatar = avatarList[i].avatar;
    for (var j in avatarList) {
      if (!avatarList[j]) continue;
      if (j != i) {
        var targetAvatar = avatarList[j].avatar;
      }
      if (avatarList[j].alive) {
        avatarList[j].update();
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