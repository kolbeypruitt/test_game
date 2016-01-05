var ready;
var myId;
var currentUsers;
var tank;
var eurecaServer;
var myId = 0;
var land;
var player;
var explosions;
var cursors;
var ready = false;
var enemies;
var bullets;
var bulletTime = 0;
var fireButton;
var score = 0;
var scoreText;
var winText;

var eurecaClientSetup = function() {
  //create an instance of eureca.io client
  var eurecaClient = new Eureca.Client();
  
  eurecaClient.ready(function (proxy) {   
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
    var spawn = new Tank(i, game, tank);
    currentUsers[i] = spawn;
  }

  eurecaClient.exports.updateState = function(id, state) {
    // console.log('updating state', id, state)
      if (currentUsers[id])  {
          currentUsers[id].cursor = state;
          currentUsers[id].tank.x = state.x;
          currentUsers[id].tank.y = state.y;
          currentUsers[id].tank.angle = state.angle;
          // currentUsers[id].turret.rotation = state.rot;
          currentUsers[id].update();
      }
  }
  
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

// var game = new Phaser.Game(800,600,Phaser.AUTO,'gameDiv');



// var mainState = {
    function preload() {
        game.load.spritesheet('walking', 'assets/marvin/walking.png', 63.5, 65, 36);
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('enemy', 'assets/pikachu.png');
        game.load.image('grass', 'assets/grass.png');
        game.load.image('logo', 'assets/game_logo.png');
    }

    // function create() {
     
    //     //  Resize our game world to be a 2000 x 2000 square
    //     game.world.setBounds(-1000, -1000, 2000, 2000);
    //     game.stage.disableVisibilityChange = true;

    //     //  Our tiled scrolling background
    //     land = game.add.tileSprite(0, 0, 1200, 800, 'grass');
    //     land.fixedToCamera = true;


    //     player = game.add.sprite(0, 0, 'walking', 27);

    //     player.animations.add('walk_left', [0,1,2,3,4,5,6,7,8], 60, false, true);
    //     player.animations.add('walk_right', [9,10,11,12,13,14,15,16,17], 60, false, true);
    //     player.animations.add('walk_up', [18,19,20,21,22,23,24,25,26], 60, false, true);
    //     player.animations.add('walk_down', [27,28,29,30,31,32,33,34,35], 60, false, true);


    //     game.physics.enable(player,Phaser.Physics.ARCADE);

    //     cursors = game.input.keyboard.createCursorKeys();

    //     bullets = game.add.group();
    //     bullets.enableBody = true;
    //     bullets.physicsBodyType = Phaser.Physics.ARCADE;
    //     bullets.createMultiple(30, 'bullet');
    //     bullets.setAll('anchor.x', 0.5);
    //     bullets.setAll('anchor.y', 1);
    //     bullets.setAll('outOfBoundsKill', true);
    //     bullets.setAll('checkWorldBounds', true);

    //     fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //     enemies = game.add.group();
    //     enemies.enableBody = true;
    //     enemies.physicsBodyType = Phaser.Physics.ARCADE;

    //     createEnemies();

    //     scoreText = game.add.text(10,550,'Score:',{font: '32px Arial',fill: '#fff'});
    //     scoreText.fixedToCamera = true;
    //     winText = game.add.text(game.world.centerX,game.world.centerY,'You Win!',{font: '32px Arial',fill: '#fff'});
    //     winText.visible = false;


    //     game.camera.follow(player);
    //     game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    //     game.camera.focusOnXY(0, 0);
    // }

    function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);
    game.stage.disableVisibilityChange  = true;
    
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'grass');
    land.fixedToCamera = true;
    
    currentUsers = {};
    
    player = new Tank(myId, game, tank);
    currentUsers[myId] = player;
    tank = player.tank;
    turret = player.turret;
    tank.x=0;
    tank.y=0;
    bullets = player.bullets;
    shadow = player.shadow; 

    tank.bringToTop();
        
    logo = game.add.sprite(150, 200, 'logo');
    logo.fixedToCamera = true;

    game.input.onDown.add(removeLogo, this);

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
    
    setTimeout(removeLogo, 2000);







    scoreText = game.add.text(10,550,'Score:',{font: '32px Arial',fill: '#fff'});
    scoreText.fixedToCamera = true;
    winText = game.add.text(game.world.centerX,game.world.centerY,'You Win!',{font: '32px Arial',fill: '#fff'});
    winText.visible = false;
}

function removeLogo () {
    game.input.onDown.remove(removeLogo, this);
    logo.kill();
}

    function update () {
        //do not update if client not ready
        if (!ready) return;
        
        player.input.left = cursors.left.isDown;
        player.input.right = cursors.right.isDown;
        player.input.up = cursors.up.isDown;
        player.input.down = cursors.down.isDown;
        player.input.fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).isDown;
        player.input.tx = game.input.x+ game.camera.x;
        player.input.ty = game.input.y+ game.camera.y;
        
        land.tilePosition.x = -game.camera.x;
        land.tilePosition.y = -game.camera.y;

        for (var i in currentUsers)
        {
            if (!currentUsers[i]) continue;
            var curBullets = currentUsers[i].bullets;
            var curTank = currentUsers[i].tank;
            for (var j in currentUsers)
            {
                if (!currentUsers[j]) continue;
                if (j!=i) 
                {
                
                    var targetTank = currentUsers[j].tank;
                    
                    game.physics.arcade.overlap(curBullets, targetTank, null, this);
                
                }
                if (currentUsers[j].alive)
                {
                    currentUsers[j].update();
                }           
            }
        }


        scoreText.text = 'Score: ' + score;

        if(score == 4000) {
            winText.visible = true;
            scoreText.visible = false;
        }

    }

function render() {}