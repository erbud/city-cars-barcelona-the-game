var Obstacle = function (game, x, y) {

    Phaser.Sprite.call(this, game, x, y, 'atlasGameScreen', 'item-obstacle.png');

    // Properties
    this.name     = 'obstacle';
    this.smoothed = false;
    this.autoCull = true;

    // Extended properties
    this.state       = game.state.getCurrentState();
    this.inCameraOut = false;

    // Config
    this.anchor.setTo(0.5, 0.8);

    // Events
    this.events.onKilled.add(function() { this.dead(); }, this);

};

Obstacle.prototype = Object.create(Phaser.Sprite.prototype);

Obstacle.prototype.constructor = Obstacle;

Obstacle.prototype.update = function () {

    if (!this.inCamera && this.inCameraOut) {
        this.kill();
    }
    else if (this.inCamera && !this.inCameraOut) {
        this.inCameraOut = true;
    }

};



Obstacle.prototype.dead = function () {

    this.inCameraOut = false;

    this.game.time.events.add(this.game.rnd.between(Phaser.Timer.MINUTE / 4, Phaser.Timer.MINUTE / 2), this.recicleObstacle, this);

};

Obstacle.prototype.recicleObstacle = function () {

    var position = this.state.getItemPosition(true);

    this.reset(position.x, position.y);

    delete position.x;
    delete position.y;

    position = null;

};