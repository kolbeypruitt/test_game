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

  this.avatar = game.add.sprite(x, y, 'marvin');

  this.avatar.animations.add('walk_up', [60,61,62,63,64,65,66,67,68], 60, false, true);
  this.avatar.animations.add('walk_left', [69,70,71,72,73,74,75,76,77], 60, false, true);
  this.avatar.animations.add('walk_down', [78,79,80,81,82,83,84,85,86], 60, false, true);
  this.avatar.animations.add('walk_right', [87,88,89,90,91,92,93,94,95], 60, false, true);

  this.avatar.animations.add('attack_up', [178,179,180,181,182,183], 60, false, true);
  this.avatar.animations.add('attack_left', [184,185,186,187,188,189], 60, false, true);
  this.avatar.animations.add('attack_down', [190,191,192,193,194,195], 60, false, true);
  this.avatar.animations.add('attack_right', [196,197,198,199,200,201], 60, false, true);

  this.avatar.animations.add('die', [172,173,174,175,176,177], 60, false, true);

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
    this.currentDir = "left"
    this.avatar.animations.play('walk_left', 8, false, false);
  }
  if (this.cursor.right) {
    this.currentDir = "right"
    this.avatar.animations.play('walk_right', 8, false, false);
    this.avatar.x += 1;
  }
  if (this.cursor.up) {
    this.currentDir = "up"
    this.avatar.animations.play('walk_up', 8, false, false);
    this.avatar.y += -1;
  }
  if (this.cursor.down) {
    this.currentDir = "down"
    this.avatar.animations.play('walk_down', 8, false, false);
    this.avatar.y += 1;
  }
  if (this.cursor.attack && this.currentDir === "left") {
    console.log("attack!");
      this.avatar.animations.play('attack_left', 8, false, false);
  }
  if (this.cursor.attack && this.currentDir === "right") {
    this.avatar.animations.play('attack_right', 8, false, false);
  }
  if (this.cursor.attack && this.currentDir === "up") {
    this.avatar.animations.play('attack_up', 8, false, false);
  }
  if (this.cursor.attack && this.currentDir === "down") {
    this.avatar.animations.play('attack_down', 8, false, false);
  }

};

Avatar.prototype.attack = function () {
    // body...
}

Avatar.prototype.kill = function() {
    this.alive = false;
    this.avatar.kill();
};