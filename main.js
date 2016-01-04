var game = new Phaser.Game(800,600,Phaser.AUTO,'gameDiv');

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

var mainState = {
    preload: function () {
        game.load.image('starfield', 'assets/starfield.png');
        game.load.spritesheet('player_down', 'assets/marvin/walk_down.png', 64, 60, 8);
        game.load.spritesheet('player_up', 'assets/marvin/walk_up.png', 64, 60, 8);
        game.load.spritesheet('player_left', 'assets/marvin/walk_left.png', 64, 60, 8);
        game.load.spritesheet('player_right', 'assets/marvin/walk_right.png', 64, 60, 8);
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('enemy', 'assets/pikachu.png');
    },

    create: function () {
        starfield = game.add.tileSprite(0,0,800,600,'starfield');
        backgroundV = 3;

        player = game.add.sprite(game.world.centerX, game.world.centerY + 200, 'player_down');

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
        winText = game.add.text(game.world.centerX,game.world.centerY,'You Win!',{font: '32px Arial',fill: '#fff'});
        winText.visible = false;
    },

    update: function () {

        game.physics.arcade.overlap(bullets,enemies,enemyKill,null,this);
        game.physics.arcade.overlap(player,enemies,playerKill,null,this);

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        starfield.tilePosition.y += backgroundV;

        if(cursors.left.isDown) {
            changeSprite("left");
            player.body.velocity.x = -600;
        }

        if(cursors.right.isDown) {
            changeSprite("right");
            player.body.velocity.x = 600;
        }

        if(cursors.up.isDown) {
            changeSprite("up");
            player.body.velocity.y = -600;
        }

        if(cursors.down.isDown) {
            changeSprite("down");
            player.body.velocity.y = 600;
        }

        if(fireButton.isDown) {
            fireBullet();
        }

        scoreText.text = 'Score: ' + score;

        if(score == 4000) {
            winText.visible = true;
            scoreText.visible = false;
        }
    }
};

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
    enemies.y += 50;
};

function enemyKill(bullet,enemy) {
    bullet.kill();
    enemy.kill();


    score += 100;
}

function playerKill(player,enemy) {
    player.kill();
}

function changeSprite(sprite) {
    if (sprite==="up") {
        player.loadTexture('player_up', 0);
    }
    if (sprite==="down") {
        player.loadTexture('player_down', 0);
    }
    if (sprite==="left") {
        player.loadTexture('player_left', 0);
    }
    if (sprite==="right") {
        player.loadTexture('player_right', 0);
    }

    player.animations.add('walk');

    player.animations.play('walk', 7, true);

}

game.state.add('mainState', mainState);

game.state.start('mainState');