var Avatar = function(index, game, player) {

  this.cursor = {
      left: false,
      right: false,
      up: false,
      down: false,
      attack: false
  };

  this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      attack: false
  };

  var x = 0;
  var y = 0;

  this.game = game;
  this.health = 30;
  this.player = player;
  this.alive = true;

  this.avatar = game.add.sprite(x, y, 'walking', 27);

  this.avatar.animations.add('walk_left', [0,1,2,3,4,5,6,7,8], 60, false, true);
  this.avatar.animations.add('walk_right', [9,10,11,12,13,14,15,16,17], 60, false, true);
  this.avatar.animations.add('walk_up', [18,19,20,21,22,23,24,25,26], 60, false, true);
  this.avatar.animations.add('walk_down', [27,28,29,30,31,32,33,34,35], 60, false, true);
  this.avatar.animations.add('attack_up', [36,39,42,45,48,51,36], 60, false, true);

  this.avatar.anchor.set(0.5);

  this.avatar.id = index;
  game.physics.enable(this.avatar, Phaser.Physics.ARCADE);
  this.avatar.body.immovable = false;
  this.avatar.body.collideWorldBounds = true;
  this.avatar.body.bounce.setTo(0, 0);

};

Avatar.prototype.update = function() {

  var inputChanged = (
      this.cursor.left != this.input.left ||
      this.cursor.right != this.input.right ||
      this.cursor.up != this.input.up ||
      this.cursor.down != this.input.down ||
      this.cursor.attack != this.input.attack
  );


  if (inputChanged) {
      //Handle input change here
      //send new values to the server     
      if (this.avatar.id == myId) {
          // send latest valid state to the server
          this.input.x = this.avatar.x;
          this.input.y = this.avatar.y;

          eurecaServer.handleKeys(this.input);

      }
  }

  if (this.cursor.left) {
    this.avatar.x += -1;
    this.avatar.animations.play('walk_left', 8, false, false);
  }
  if (this.cursor.right) {
    this.avatar.animations.play('walk_right', 8, false, false);
    this.avatar.x += 1;
  }
  if (this.cursor.up) {
    this.avatar.animations.play('walk_up', 8, false, false);
    this.avatar.y += -1;
  }
  if (this.cursor.down) {
    this.avatar.animations.play('walk_down', 8, false, false);
    this.avatar.y += 1;
  }
  if (this.cursor.attack) {
    console.log("attack!");
    this.avatar.animations.play('attack_up', 8, false, false);
  }

};

Avatar.prototype.attack = function () {
    // body...
}

Avatar.prototype.kill = function() {
    this.alive = false;
    this.avatar.kill();
};