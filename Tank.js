var Tank = function(index, game, player) {
    this.cursor = {
        left: false,
        right: false,
        up: false,
        fire: false
    };

    this.input = {
        left: false,
        right: false,
        up: false,
        fire: false
    };

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 30;
    this.player = player;
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);


    this.currentSpeed = 0;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;

    this.tank = game.add.sprite(x, y, 'walking', 27);

    this.tank.anchor.set(0.5);

    this.tank.id = index;
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);

    this.tank.angle = 0;

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);

};

Tank.prototype.update = function() {

    var inputChanged = (
        this.cursor.left != this.input.left ||
        this.cursor.right != this.input.right ||
        this.cursor.up != this.input.up ||
        this.cursor.down != this.input.down ||
        this.cursor.fire != this.input.fire
    );


    if (inputChanged) {
        //Handle input change here
        //send new values to the server     
        if (this.tank.id == myId) {
            // send latest valid state to the server
            this.input.x = this.tank.x;
            this.input.y = this.tank.y;
            this.input.angle = this.tank.angle;


            eurecaServer.handleKeys(this.input);

        }
    }



    if (this.cursor.left) {
        this.tank.x += -1;
        // this.tank.angle -= 1;
    } else if (this.cursor.right) {
        // this.tank.body.velocity.x = 150;
        this.tank.x += 1;
        // this.tank.angle += 1;
    }
    if (this.cursor.up) {
        this.tank.y += -1;
        //  The speed we'll travel at
        // this.currentSpeed = 100;
    }
    if (this.cursor.down) {
        this.tank.y += 1;
        //  The speed we'll travel at
        // this.currentSpeed = 200;
    }
    // else {
    //     if (this.currentSpeed > 0) {
    //         this.currentSpeed -= 4;
    //     }
    // }


    if (this.currentSpeed > 0) {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
    } else {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
    }

};

Tank.prototype.fire = function(target) {
    if (!this.alive) return;
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        this.nextFire = this.game.time.now + this.fireRate;
        var bullet = this.bullets.getFirstDead();
        // bullet.reset(this.turret.x, this.turret.y);

        bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);
    }
};


Tank.prototype.kill = function() {
    this.alive = false;
    this.tank.kill();
};