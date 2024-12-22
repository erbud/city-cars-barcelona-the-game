var Power = function (game, x, y) {

    Phaser.Sprite.call(this, game, x, y, 'atlasGameScreen', 'item-power/0000.png');

    // Properties
    this.name     = 'power';
    this.smoothed = false;
    this.autoCull = true;

    // Extended properties
    this.state = game.state.getCurrentState();
    
    // Config
    this.anchor.setTo(0.5, 0.8);

    // Animation
    this.animations.add('cycle', Phaser.Animation.generateFrameNames('item-power/', 0, 3, '.png', 4), 5, true);
    this.animations.play('cycle');

    // Events
    this.events.onKilled.add(function() { this.dead(); }, this);

};

Power.prototype = Object.create(Phaser.Sprite.prototype);

Power.prototype.constructor = Power;

Power.prototype.update = function () {};



Power.prototype.dead = function () {

    this.game.time.events.add(this.game.rnd.between(Phaser.Timer.MINUTE * 1.5, Phaser.Timer.MINUTE * 2), this.reciclePower, this);

};

Power.prototype.reciclePower = function () {

    var position = this.state.getItemPosition(true);

    this.reset(position.x, position.y);

    delete position.x;
    delete position.y;

    position = null;

};