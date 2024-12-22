var Enemy = function (game, x, y) {

    this.enemyType        = 'enemy-' + game.rnd.between(1, 3);

    Phaser.Sprite.call(this, game, x, y, 'atlasGameScreen', this.enemyType +'/0000.png');

    // Properties
    this.name             = 'enemy';
    this.smoothed         = false;
    this.autoCull         = true;

    // Extended properties
    this.state            = game.state.getCurrentState();
    this.facing           = 1;
    this.velocity         = 0;
    this.jumpTimer        = 0;
    this.transitionTimer  = 0;
    this.isJumping        = false;
    this.isInTransition   = false;
    this.isInCapture      = false;
    this.isDesintegrated  = false;
    this.inCameraOut      = false;

    // Config
    this.anchor.setTo(0.5, 0.8);

    // Animations
    this.anim = {
        'runRight'         : this.animations.add('run-right', Phaser.Animation.generateFrameNames(this.enemyType +'/', 0, 3, '.png', 4), 15, true),
        'runLeft'          : this.animations.add('run-left', Phaser.Animation.generateFrameNames(this.enemyType +'/', 22, 25, '.png', 4), 15, true),

        'jumpRightUp'      : this.animations.add('jump-right-up', Phaser.Animation.generateFrameNames(this.enemyType +'/', 4, 8, '.png', 4), 15, false),
        'jumpRightDown'    : this.animations.add('jump-right-down', [this.enemyType +'/0009.png', this.enemyType +'/0010.png', this.enemyType +'/0011.png', this.enemyType +'/0012.png', this.enemyType +'/0004.png'], 15, false),
        'jumpLeftUp'       : this.animations.add('jump-left-up', Phaser.Animation.generateFrameNames(this.enemyType +'/', 26, 30, '.png', 4), 15, false),
        'jumpLeftDown'     : this.animations.add('jump-left-down', [this.enemyType +'/0031.png', this.enemyType +'/0032.png', this.enemyType +'/0033.png', this.enemyType +'/0034.png', this.enemyType +'/0026.png'], 15, false),

        'captureRightFront': this.animations.add('capture-right-front', [this.enemyType +'/0013.png'], 1, false),
        'captureRightBack' : this.animations.add('capture-right-back', [this.enemyType +'/0014.png'], 1, false),
        'captureLeftFront' : this.animations.add('capture-left-front', [this.enemyType +'/0035.png'], 1, false),
        'captureLeftBack'  : this.animations.add('capture-left-back', [this.enemyType +'/0036.png'], 1, false),

        'desintegrateRight': this.animations.add('desintegrate-right', Phaser.Animation.generateFrameNames(this.enemyType +'/', 15, 21, '.png', 4), 30, false),
        'desintegrateLeft' : this.animations.add('desintegrate-left', Phaser.Animation.generateFrameNames(this.enemyType +'/', 37, 43, '.png', 4), 30, false)
    };

    // Events
    this.anim.jumpRightDown.onComplete.add(this.run, this);
    this.anim.jumpLeftDown.onComplete.add(this.run, this);

    this.anim.desintegrateRight.onComplete.add(this.dead, this);
    this.anim.desintegrateLeft.onComplete.add(this.dead, this);

};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);

Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function () {

    // States
    this.isJumping      = (this.game.time.now < this.jumpTimer) ? true : false;
    this.isInTransition = (this.game.time.now < this.transitionTimer) ? true : false;

    // Movement Controls
    this.control();

};



Enemy.prototype.run = function () {

    if (!this.state.levelCompleted && !this.isDesintegrated && this.alive) {
        this.isInCapture = false;

        // Animations
        this.animations.play((this.facing === 1) ? 'run-right' : 'run-left');
        
        // Behaviors
        this.body.velocity.x = this.velocity * this.facing;
    }

};

Enemy.prototype.dead = function () {

    this.kill();
    this.isDesintegrated = false;
    this.inCameraOut     = false;

    if (this.state.groupActors.countDead() > 8) {
        this.game.time.events.add(Phaser.Timer.SECOND / 5, this.destroy, this);
    }

};

Enemy.prototype.desintegrate = function () {

    if (!this.isDesintegrated) {
        this.isDesintegrated = true;

        this.animations.play((this.facing === 1) ? 'desintegrate-right' : 'desintegrate-left');
    }

};

Enemy.prototype.capturePlayer = function () {

    this.isInCapture     = true;
    this.body.velocity.x = 0;

    if (this.x > this.state.player.x) {
        this.animations.play((this.facing === 1) ? 'capture-right-back' : 'capture-left-front');
    }
    else {
        this.animations.play((this.facing === 1) ? 'capture-right-front' : 'capture-left-back');
    }
    
    this.game.time.events.add(Phaser.Timer.SECOND * 2, this.run, this);

};

Enemy.prototype.setFacing = function () {

    var facing = 0;

    if (this.x < this.state.player.x) {
        facing = (this.state.player.facing === 1) ? 1 : (this.state.rnd.normal() < 0) ? -1 : 1;
    }
    else {
        facing = (this.state.player.facing === -1) ? -1 : (this.state.rnd.normal() < 0) ? -1 : 1;
    }

    this.facing = facing;

    facing = null;

};

Enemy.prototype.setVelocity = function () {

    var velocity = 0;

    if (this.x < this.state.player.x) {
        /* E --> P */
        velocity = (this.facing === 1 && this.state.player.facing === 1) ?
                        this.game.rnd.between(this.state.gameSpeed + 25, this.state.gameSpeed + 50) /* ->   -> */
                    :
                        (this.facing === -1 && this.state.player.facing === -1) ?
                            this.game.rnd.between(this.state.gameSpeed - 50, this.state.gameSpeed - 75) /* <-   <- */
                        :
                            (this.facing === 1 && this.state.player.facing === -1) ?
                                this.game.rnd.between(this.state.gameSpeed - 75, this.state.gameSpeed - 125) /* ->   <- */
                            :
                                this.state.gameSpeed;
    }
    else {
        /* P --> E */
        velocity = (this.state.player.facing === 1 && this.facing === 1) ?
                        this.game.rnd.between(this.state.gameSpeed - 50, this.state.gameSpeed - 75)  /* ->   -> */
                    :
                        (this.state.player.facing === -1 && this.facing === -1) ?
                            this.game.rnd.between(this.state.gameSpeed + 25, this.state.gameSpeed + 50) /* <-   <- */
                        :
                            (this.state.player.facing === 1 && this.facing === -1) ?
                                this.game.rnd.between(this.state.gameSpeed - 75, this.state.gameSpeed - 125) /* ->   <- */
                            :
                                this.state.gameSpeed;
    }

    this.velocity = velocity;

    velocity = null;

};

Enemy.prototype.control = function () {

    if (!this.state.levelCompleted && !this.isInCapture && !this.isDesintegrated) {
        // Life cycle
        if (this.inCamera && !this.inCameraOut) {
            this.inCameraOut = true;
        }
        /* Kill */
        if ((!this.isInTransition && (this.state.mapLayerPlatforms.getTileX(this.x) === 1 || this.state.mapLayerPlatforms.getTileX(this.x) === this.state.map.width - 2)) || (!this.inCamera && this.inCameraOut)) {
            this.dead();
        }
        /* Jump */
        else if ((!this.isJumping && this.deltaY === 0 && !this.state.checkToJump('ceiling', this) && this.state.checkToJump('platform', this)) && (this.state.player.y + 64 < this.y && !this.state.player.isJumping) && this.game.rnd.normal() > 0) {
            this.jumpTimer       = this.game.time.now + 1500;
            this.body.velocity.x = (this.state.gameSpeed / 1.2) * this.facing;
            this.body.velocity.y = (!this.state.checkToJump('ceiling', this) && this.state.checkToJump('platform', this)) ? -595 : -440;
            this.animations.play((this.facing === 1) ? 'jump-right-up' : 'jump-left-up');
        }
        /* Fall */
        else if (!this.isJumping && this.deltaY > 0) {
            this.body.velocity.x = (this.state.gameSpeed / 1.2) * this.facing;
            this.animations.play((this.facing === 1) ? 'jump-right-down' : 'jump-left-down');
        }
    }
    else if (this.state.levelCompleted) {
        this.body.velocity.x = 0;
    }

};