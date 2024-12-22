var Player = function (game, x, y) {

    Phaser.Sprite.call(this, game, x, y, 'atlasGameScreen', 'player/0000.png');

    // Properties
    this.name     = 'player';
    this.smoothed = false;

    // Extended properties
    this.state              = game.state.getCurrentState();
    this.facing             = 1;
    this.velocity           = this.state.gameSpeed;
    this.jumpTimer          = 0;
    this.transitionTimer    = 0;
    this.power              = false;
    this.isJumping          = false;
    this.isInTransition     = false;
    this.isRevived          = false;

    // Config
    this.anchor.setTo(0.5, 0.8);

    // Animations
    this.anim = {
        'runRight'           : this.animations.add('run-right', Phaser.Animation.generateFrameNames('player/', 0, 3, '.png', 4), 15, true),
        'runLeft'            : this.animations.add('run-left', Phaser.Animation.generateFrameNames('player/', 20, 23, '.png', 4), 15, true),

        'jumpRightUp'        : this.animations.add('jump-right-up', Phaser.Animation.generateFrameNames('player/', 4, 5, '.png', 4), 15, false),
        'jumpRightDown'      : this.animations.add('jump-right-down', ['player/0006.png','player/0004.png'], 15, false),
        'jumpLeftUp'         : this.animations.add('jump-left-up', Phaser.Animation.generateFrameNames('player/', 24, 25, '.png', 4), 15, false),
        'jumpLeftDown'       : this.animations.add('jump-left-down', ['player/0026.png','player/0024.png'], 15, false),

        /*
        'collisionRightFront': this.animations.add('collision-right-front', ['player/0007.png'], 15, false),
        'collisionRightBack' : this.animations.add('collision-right-back', ['player/0008.png'], 15, false),
        'collisionLeftFront' : this.animations.add('collision-left-front', ['player/0027.png'], 15, false),
        'collisionLeftBack'  : this.animations.add('collision-left-back', ['player/0028.png'], 15, false),
        */

        'turnRight'          : this.animations.add('turn-right', Phaser.Animation.generateFrameNames('player/', 1, 2, '.png', 4), 4, false),
        'turnLeft'           : this.animations.add('turn-left', Phaser.Animation.generateFrameNames('player/', 21, 22, '.png', 4), 4, false),

        'deadRight'          : this.animations.add('dead-right', Phaser.Animation.generateFrameNames('player/', 10, 11, '.png', 4), 15, true),
        'deadLeft'           : this.animations.add('dead-left', Phaser.Animation.generateFrameNames('player/', 30, 31, '.png', 4), 15, true),

        'runRightPower'      : this.animations.add('run-right-power', Phaser.Animation.generateFrameNames('player/', 12, 15, '.png', 4), 15, true),
        'runLeftPower'       : this.animations.add('run-left-power', Phaser.Animation.generateFrameNames('player/', 32, 35, '.png', 4), 15, true),

        'jumpRightUpPower'   : this.animations.add('jump-right-up-power', Phaser.Animation.generateFrameNames('player/', 16, 17, '.png', 4), 15, false),
        'jumpRightDownPower' : this.animations.add('jump-right-down-power', ['player/0018.png','player/0016.png'], 15, false),
        'jumpLeftUpPower'    : this.animations.add('jump-left-up-power', Phaser.Animation.generateFrameNames('player/', 36, 37, '.png', 4), 15, false),
        'jumpLeftDownPower'  : this.animations.add('jump-left-down-power', ['player/0038.png','player/0036.png'], 15, false),

        'turnRightPower'     : this.animations.add('turn-right-power', Phaser.Animation.generateFrameNames('player/', 13, 14, '.png', 4), 4, false),
        'turnLeftPower'      : this.animations.add('turn-left-power', Phaser.Animation.generateFrameNames('player/', 33, 34, '.png', 4), 4, false)
    };

    // Listeners
    this.listenerPower;
    this.listenerRevive;

    // Events
    this.events.onKilled.add(this.dead, this);

    this.anim.jumpRightDown.onComplete.add(this.run, this);
    this.anim.jumpLeftDown.onComplete.add(this.run, this);

    this.anim.turnRight.onComplete.add(this.run, this);
    this.anim.turnLeft.onComplete.add(this.run, this);

    this.anim.jumpRightDownPower.onComplete.add(this.run, this);
    this.anim.jumpLeftDownPower.onComplete.add(this.run, this);

    this.anim.turnRightPower.onComplete.add(this.run, this);
    this.anim.turnLeftPower.onComplete.add(this.run, this);

};

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.constructor = Player;

Player.prototype.update = function () {

    // States
    this.isJumping      = (this.game.time.now < this.jumpTimer) ? true : false;
    this.isInTransition = (this.game.time.now < this.transitionTimer) ? true : false;

    // Movement Controls
    this.control();

};



Player.prototype.run = function () {

    if (!this.state.levelCompleted) {
        // Animations
        if (this.power) {
            this.animations.play((this.facing === 1) ? 'run-right-power' : 'run-left-power');   
        }
        else {
            this.animations.play((this.facing === 1) ? 'run-right' : 'run-left');
        }

        // Behaviors
        this.body.mass       = 2;
        this.body.velocity.x = this.velocity * this.facing;

        // Touch Controls
        this.state.updateTouchControls();
    }

};

Player.prototype.dead = function () {

    this.state.updateLives('subtract');

    this.clearPower();
    
    if (this.state.lives > 0) {
        this.visible = true;

        this.state.updateTouchControls(true);
        this.game.time.events.add(Phaser.Timer.SECOND * 2, this.revive, this);
    }
    else {
        this.visible = true;

        this.animations.play((this.facing === 1) ? 'dead-right' : 'dead-left');

        this.state.gameOver();
    }

};

Player.prototype.revive = function () {

    this.facing     = 1;
    this.power      = false;
    this.isRevived  = true;

    this.body.checkCollision.top    = false;
    this.body.checkCollision.right  = false;
    this.body.checkCollision.bottom = false;
    this.body.checkCollision.left   = false;

    this.game.camera.focusOnXY(0, 0);

    this.state.updateFuel();
    
    this.reset(100, 650);

    this.run();

    this.listenerRevive = this.game.time.events.loop(Phaser.Timer.SECOND / 4, this.statusRevive, this);

    this.game.time.events.add(Phaser.Timer.SECOND * 3, this.clearRevive, this);

};

Player.prototype.statusRevive = function () {

    if (this.alpha === 1 && this.isRevived) {
        this.alpha = 0.5;
    }
    else {
        this.alpha = 1;
    }

};

Player.prototype.clearRevive = function () {

    this.game.time.events.remove(this.listenerRevive);

    this.alpha     = 1;
    this.isRevived = false;

    this.body.checkCollision.top    = true;
    this.body.checkCollision.right  = true;
    this.body.checkCollision.bottom = true;
    this.body.checkCollision.left   = true;

};

Player.prototype.toPower = function () {

    this.power = true;

    this.animations.play((this.facing === 1) ? 'run-right-power' : 'run-left-power'); 

};

Player.prototype.toDisempower = function () {

    this.listenerPower = this.game.time.events.loop(Phaser.Timer.SECOND / 4, this.statusPower, this);

    this.game.time.events.add(Phaser.Timer.SECOND * 5, this.clearPower, this);

};

Player.prototype.statusPower = function () {

    if (this.alpha === 1 && this.power) {
        this.alpha = 0.5;
    }
    else {
        this.alpha = 1;
    }

};

Player.prototype.clearPower = function () {

    this.game.time.events.remove(this.listenerPower);

    this.animations.play((this.facing === 1) ? 'run-right' : 'run-left');

    this.alpha = 1;
    this.power = false;

};

Player.prototype.checkTransitionScroll = function () {

    // Move player
    if (!this.isInTransition && this.state.mapLayerPlatforms.getTileX(this.x) === 0) {
        this.x = this.state.map.widthInPixels;
        this.transitionTimer = this.game.time.now + 200;
    }
    else if (!this.isInTransition && this.state.mapLayerPlatforms.getTileX(this.x) === this.state.map.width - 1) {
        this.x = 0;
        this.transitionTimer = this.game.time.now + 200;
    }
    else if (this.isInTransition) {
        this.run();
    }

};

Player.prototype.control = function (button) {

    var capitalize  = function (s) { return s.charAt(0).toUpperCase() + s.slice(1) },
        action      = { 'direction': null, 'facing': null, 'animation': null },
        button      = button || '',
        currentAnim = this.animations.currentAnim.name;

    // Transition scroll
    this.checkTransitionScroll();

    // Left & Right
    if (this.state.cursors || button) {
        action.direction = (this.state.cursors.left.isDown || button.indexOf('bt-left') !== -1) ? 'left' : (this.state.cursors.right.isDown || button.indexOf('bt-right') !== -1) ? 'right' : null;

        if (action.direction !== null) {
            action.facing = (action.direction === 'left' && this.facing === 1) ? -1 : (action.direction === 'right' && this.facing === -1) ? 1 : null;
            
            if (action.facing !== null) {
                this.facing = action.facing;
                
                action.animation = '/^(turn' + capitalize(action.direction) + ')/g';

                if (currentAnim.search(action.animation) === -1) {
                    this.body.velocity.x = (this.velocity / 2) * this.facing * -1;
                    this.animations.play((this.power) ? 'turn-' + action.direction + '-power' : 'turn-' + action.direction);
                }
                this.state.mapBackground.autoScroll(30 * this.facing * -1, 0);
            }
        }
    }

    // Jump
    if (((this.state.jumpButton && this.state.jumpButton.isDown) || button.indexOf('bt-jump') !== -1) && (!this.isJumping && this.deltaY === 0)) {
        // Touch control
        if (this.game.device.touch) {
            this.state.interfaceTouchControlsJump.inputEnabled = false;
            this.state.interfaceTouchControlsJump.frameName = 'bt-jump/0000.png';
        }
        // Animation
        if (this.power) {
            this.animations.play((this.facing === 1) ? 'jump-right-up-power' : 'jump-left-up-power');
        }
        else {
            this.animations.play((this.facing === 1) ? 'jump-right-up' : 'jump-left-up');
        }
        // Behavior
        this.jumpTimer       = this.game.time.now + 1500;
        this.body.velocity.y = (!this.state.checkToJump('ceiling', this) && this.state.checkToJump('platform', this)) ? -595 : -440;
    }
    else if (this.game.device.touch && (!this.state.interfaceTouchControlsJump.inputEnabled && !this.isJumping)) {
        // Behavior
        this.state.interfaceTouchControlsJump.inputEnabled = true;
        this.state.interfaceTouchControlsJump.frameName = 'bt-jump/0001.png';
    }
    else if (this.deltaY > 0) {
        // Animation
        if (this.power) {
            this.animations.play((this.facing === 1) ? 'jump-right-down-power' : 'jump-left-down-power');   
        }
        else {
            this.animations.play((this.facing === 1) ? 'jump-right-down' : 'jump-left-down');
        }
    }

    delete action.direction;
    delete action.facing;
    delete action.animation;

    capitalize = action = button = currentAnim = null;
    
};