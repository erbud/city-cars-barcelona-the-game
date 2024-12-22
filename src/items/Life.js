var Life = function (game, x, y) {

    Phaser.Sprite.call(this, game, x, y, 'atlasGameScreen', 'item-life/0000.png');

    // Properties
    this.name     = 'life';
    this.smoothed = false;
    this.autoCull = true;

    // Extended properties
    this.state = game.state.getCurrentState();

    // Config
    this.anchor.setTo(0.5, 0.8);

    // Animation
    this.animations.add('cycle', Phaser.Animation.generateFrameNames('item-life/', 0, 1, '.png', 4), 5, true);
    this.animations.play('cycle');

    // Events
    this.events.onKilled.add(function() { this.dead(); }, this);

};

Life.prototype = Object.create(Phaser.Sprite.prototype);

Life.prototype.constructor = Life;

Life.prototype.update = function () {};



Life.prototype.dead = function () {

    if (this.state.lives === 5) {
        this.game.time.events.add(Phaser.Timer.MINUTE / 2, this.dead, this);
    }
    else {
        this.game.time.events.add(this.game.rnd.between(Phaser.Timer.MINUTE * 2, Phaser.Timer.MINUTE * 2.5), this.recicleLife, this);
    }

};

Life.prototype.recicleLife = function () {

    var position = this.state.getItemPosition(true);

    this.reset(position.x, position.y);

    delete position.x;
    delete position.y;

    position = null;

};