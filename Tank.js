var Tank = function(index, game, player) {
    this.cursor = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false
    };

    this.input = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false
    };

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 30;
    this.player = player;
    this.alive = true;

    this.tank = game.add.sprite(x, y, 'walking', 27);

    this.tank.animations.add('walk_left', [0,1,2,3,4,5,6,7,8], 60, false, true);
    this.tank.animations.add('walk_right', [9,10,11,12,13,14,15,16,17], 60, false, true);
    this.tank.animations.add('walk_up', [18,19,20,21,22,23,24,25,26], 60, false, true);
    this.tank.animations.add('walk_down', [27,28,29,30,31,32,33,34,35], 60, false, true);

    this.tank.anchor.set(0.5);

    this.tank.id = index;
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);

};

Tank.prototype.update = function() {

    var inputChanged = (
        this.cursor.left != this.input.left ||
        this.cursor.right != this.input.right ||
        this.cursor.up != this.input.up ||
        this.cursor.down != this.input.down
    );


    if (inputChanged) {
        //Handle input change here
        //send new values to the server     
        if (this.tank.id == myId) {
            // send latest valid state to the server
            this.input.x = this.tank.x;
            this.input.y = this.tank.y;

            eurecaServer.handleKeys(this.input);

        }
    }

    if (this.cursor.left) {
        this.tank.x += -1;
        this.tank.animations.play('walk_left', 8, false, false);
    }
    if (this.cursor.right) {
        this.tank.animations.play('walk_right', 8, false, false);
        this.tank.x += 1;
    }
    if (this.cursor.up) {
        this.tank.animations.play('walk_up', 8, false, false);
        this.tank.y += -1;
    }
    if (this.cursor.down) {
        this.tank.animations.play('walk_down', 8, false, false);
        this.tank.y += 1;
    }

};

Tank.prototype.attack = function () {
    // body...
}

Tank.prototype.kill = function() {
    this.alive = false;
    this.tank.kill();
};