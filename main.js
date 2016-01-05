

var ready = false;
var eurecaServer;
//this function will handle client communication with the server
var eurecaClientSetup = function() {
  //create an instance of eureca.io client
  var eurecaClient = new Eureca.Client();
  
  eurecaClient.ready(function (proxy) {   
    eurecaServer = proxy;
    
    
    //we temporary put create function here so we make sure to launch the game once the client is ready
    create();
    ready = true;
  }); 
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gamediv', { preload: preload, create: eurecaClientSetup, update: update, render: render });
//
//
// everything above this is eureca code
//
//

// var game = new Phaser.Game(800,600,Phaser.AUTO,'gameDiv');

var starfield;

var backgroundV;

var player;

var cursors;

var bullets;
var bulletTime = 0;
var fireButton;

var enemies;

var score = 0;
var scoreText;
var winText;

// var mainState = {
    function preload() {
        // game.load.spritesheet('player_down', 'assets/marvin/walk_down.png', 64, 60, 8);
        // game.load.spritesheet('player_up', 'assets/marvin/walk_up.png', 64, 60, 8);
        // game.load.spritesheet('player_left', 'assets/marvin/walk_left.png', 64, 60, 8);
        // game.load.spritesheet('player_right', 'assets/marvin/walk_right.png', 64, 60, 8);

        game.load.spritesheet('walking', 'assets/marvin/walking.png', 63.5, 65, 36);
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('enemy', 'assets/pikachu.png');
        game.load.image('grass', 'assets/grass.png');
    }

    function create() {
     
        //  Resize our game world to be a 2000 x 2000 square
        game.world.setBounds(-1000, -1000, 2000, 2000);
        game.stage.disableVisibilityChange = true;

        //  Our tiled scrolling background
        land = game.add.tileSprite(0, 0, 1200, 800, 'grass');
        land.fixedToCamera = true;


        player = game.add.sprite(0, 0, 'walking', 27);

        player.animations.add('walk_left', [0,1,2,3,4,5,6,7,8], 6, false, true);
        player.animations.add('walk_right', [9,10,11,12,13,14,15,16,17], 6, false, true);
        player.animations.add('walk_up', [18,19,20,21,22,23,24,25,26], 6, false, true);
        player.animations.add('walk_down', [27,28,29,30,31,32,33,34,27], 6, false, true);

        game.physics.enable(player,Phaser.Physics.ARCADE);

        cursors = game.input.keyboard.createCursorKeys();

        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(30, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 1);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);

        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;

        createEnemies();

        scoreText = game.add.text(10,550,'Score:',{font: '32px Arial',fill: '#fff'});
        scoreText.fixedToCamera = true;
        winText = game.add.text(game.world.centerX,game.world.centerY,'You Win!',{font: '32px Arial',fill: '#fff'});
        winText.visible = false;


        game.camera.follow(player);
        game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        game.camera.focusOnXY(0, 0);
    }

    function update () {
      //do not update if client not ready
      if (!ready) return;

        game.physics.arcade.overlap(bullets,enemies,enemyKill,null,this);
        game.physics.arcade.overlap(player,enemies,playerKill,null,this);

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        // player.animations.stop();

        if (cursors.left.isDown){
            player.body.velocity.x = -150;
            player.animations.play('walk_left', 8, false, false);
        }
        if(cursors.right.isDown) {
            player.animations.play('walk_right', 8, false, false);
            player.body.velocity.x = 150;
        }
        if(cursors.up.isDown) {
            player.animations.play('walk_up', 8, false, false);
            player.body.velocity.y = -150;
        }
        if(cursors.down.isDown) {
            player.animations.play('walk_down', 8, false, false);
            player.body.velocity.y = 150;
        }
        player.animations.play('run', 7, false, false);
        if(fireButton.isDown) {
            fireBullet();
        }


        scoreText.text = 'Score: ' + score;


        if(score == 4000) {
            winText.visible = true;
            scoreText.visible = false;
        }

        land.tilePosition.x = -game.camera.x;
        land.tilePosition.y = -game.camera.y;
    }
// };

function fireBullet() {
    if(game.time.now > bulletTime) {
        bullet = bullets.getFirstExists(false);

        if (bullet) {
            bullet.reset(player.x + 32, player.y);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }
}

function createEnemies() {
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 10; x++) {
            var enemy = enemies.create(x*48,y*50, 'enemy');
            enemy.anchor.setTo(0.5,0.5);
        }
    }

    enemies.x = 100;
    enemies.y = 50;


    var tween = game.add.tween(enemies).to({x:200},2000,Phaser.Easing.Linear.None,true,0,1000,true);

    tween.onLoop.add(descend,this);
};

function descend() {
    enemies.y += 20;
};

function enemyKill(bullet,enemy) {
    bullet.kill();
    enemy.kill();


    score += 100;
}

function playerKill(player,enemy) {
    player.kill();
}


function render() {}

// game.state.add('mainState', mainState);

// game.state.start('mainState');