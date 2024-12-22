var Fuel = function (game, x, y) {

    Phaser.Sprite.call(this, game, x, y, 'atlasGameScreen', 'item-fuel.png');

    // Properties
    this.name     = 'fuel';
    this.smoothed = false;
    this.autoCull = true;

    // Extended properties
    this.state = game.state.getCurrentState();

    // Config
    this.anchor.setTo(0.5, 0.8);

    // Events
    this.events.onKilled.add(function() { this.dead(); }, this);

};

Fuel.prototype = Object.create(Phaser.Sprite.prototype);

Fuel.prototype.constructor = Fuel;

Fuel.prototype.update = function () {};



Fuel.prototype.dead = function () {

    this.game.time.events.add(Phaser.Timer.SECOND * 10, this.recicleFuel, this);

};

Fuel.prototype.recicleFuel = function () {

    var position = this.state.getItemPosition(true);

    this.reset(position.x, position.y);

    delete position.x;
    delete position.y;

    position = null;

};