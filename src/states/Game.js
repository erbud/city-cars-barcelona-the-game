BasicGame.Game = function (game) {

    //	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
    this.map;
    this.mapLayerPlatforms;
    this.mapBackground;
    this.mapSky;
    this.music;

    this.player;
    this.cursors;
    this.jumpButton;

    this.levelCompleted     = false;
    this.level              = 0;
    this.levelScore         = 0;
    this.levelCountTiles    = 0;
    this.lives              = 0;
    this.fuel               = 0;
    this.countdown          = 0;
    this.gameSpeed          = 0;
    this.resources          = 0;

    this.bmdTerrain;
    this.groupActors;
    this.groupInterface;
    this.interfaceTouchControls;
    this.interfaceTouchControlsLeft;
    this.interfaceTouchControlsRight;
    this.interfaceTouchControlsJump;
    this.interfaceCountdown;
    this.interfaceCountdownBox;
    this.interfaceCountdownLevel;
    this.interfaceLife;
    this.interfaceFuel;
    this.interfaceMute;
    this.interfacePause;
    this.interfaceLevelScore;
    this.interfaceLevelCompleted;
    this.interfaceLevelCompletedBg;
    this.interfaceGameOver;
    this.interfaceGameOverBg;

    this.listenerEnemies;

};

BasicGame.Game.prototype = {

    init: function (level, lives) {

        this.level               = level || 1;
        this.lives               = lives || 5;

        this.levelCompleted      = false;
        this.levelScore          = 0;
        this.fuel                = 200;
        this.countdown           = 5;
        this.gameSpeed           = 275;
        this.resources           = (this.level <= 3) ? 1 : (this.level >= 4 && this.level <= 6) ? 2 : (this.level >= 7 && this.level <= 9) ? 3 : 4;

    },

    preload: function (game) {

        // Map level
        game.load.tilemap('mapLevel', 'assets/tilemaps/maps/tilemap-'+ this.level +'.json', null, Phaser.Tilemap.TILED_JSON);

        // Map audio
        game.load.audio('musicLevel', 'assets/audio/single-'+ this.getMusic() +'.ogg');
        game.load.audio('effectLevelCompleted', 'assets/audio/police-radio.ogg');
        game.load.audio('effectGameOver', 'assets/audio/police-siren.ogg');
        
        // Map assets
        game.load.image('mapBackground', 'assets/img/bg-'+ this.resources +'.png');
        game.load.image('mapSky', 'assets/img/bg-'+ this.resources +'-sky-'+ this.getSkyType() +'.png');

        game.load.image('mapTerrain', 'assets/tilemaps/tiles/terrain-'+ this.resources +'.png');

    },

    create: function (game) {

        var imgTerrain = {};

        // Configure physics
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 800;

        // Load background
        this.mapSky        = this.add.tileSprite(0, 0, 4608, 704, 'mapSky');
        this.mapBackground = this.add.tileSprite(0, 225, 4608, 704, 'mapBackground');

        // Create level map
        this.map = this.add.tilemap('mapLevel');
        this.map.addTilesetImage('terrain', 'mapTerrain');
        this.mapLayerPlatforms = this.map.createLayer(0);
        this.mapLayerPlatforms.resizeWorld();

        // Set the tiles for collision.
        this.map.setCollision([1,2,3,4], true, 0);

        // Count tiles level
        this.levelCountTiles = this.countTilesOfTheLevel();

        // Create group way tiles
        this.bmdTerrain      = this.add.bitmapData(this.map.widthInPixels, this.map.heightInPixels);
        imgTerrain           = this.add.image(0, 0, this.bmdTerrain);

        // Create group actors
        this.groupActors = this.add.group();

        // Create Interfaces
        this.addInterface();

        // Initialize camera
        this.camera.focusOnXY(100, 650);

        // Play Music
        this.music = this.add.audio('musicLevel');
        
        if (BasicGame.music) {
            this.music.play('', 0, 1, true);
        }

        // Listeners
        this.time.events.add(0, this.setCountdown, this);

        // Events
        game.onPause.add(this.onGamePause, this);
        game.onResume.add(this.onGameResume, this);

        game.input.onDown.add(function () {
            game.paused = false;
        }, this);

        imgTerrain = null;

    },

    update: function (game) {

        // Collisions
        if (this.groupActors.countLiving() > 0) {
            this.physics.arcade.collide([this.mapLayerPlatforms, this.player], this.groupActors, this.onCollision, null, this);
        }
        
        // Effect message level completed
        if (this.levelCompleted && this.interfaceLevelCompleted) {
            this.interfaceLevelCompleted.updateCrop();
        }

    },

    render: function (game) {

        /*
        if (this.player) {
            game.debug.bodyInfo(this.player, 100, 100);
            game.debug.body(this.player);
        }
        
        game.time.advancedTiming = true;
        game.debug.text(game.time.fps || '--', 2, 14, "#ffffff");
        */

    },

    shutdown: function (game) {

        // Clear listeners
        this.time.events.remove(this.listenerEnemies);

        // Clear groups and map
        this.groupActors.destroy();
        this.groupInterface.destroy();
        this.map.destroy();
        
        // Clear screen messages
        if (this.interfaceLevelCompletedBg) {
            this.interfaceLevelCompletedBg.destroy();
        }
        if (this.interfaceLevelCompleted) {
            this.interfaceLevelCompleted.destroy();
        }
        if (this.interfaceGameOverBg) {
            this.interfaceGameOverBg.destroy();
        }
        if (this.interfaceGameOver) {
            this.interfaceGameOver.destroy();
        }

        // Clear assets level
        this.cache.removeTilemap('mapLevel');
        this.cache.removeSound('musicLevel');
        this.cache.removeSound('effectLevelCompleted');
        this.cache.removeSound('effectGameOver');
        this.cache.removeImage('mapBackground');
        this.cache.removeImage('mapSky');
        this.cache.removeImage('mapTerrain');

    },



    initGame: function () {

        var difficulty = (this.level === 1) ? Phaser.Timer.SECOND * 4 : (this.level >= 2 && this.level <= 5) ? Phaser.Timer.SECOND * 3 : (this.level >= 6 && this.level <= 9) ? Phaser.Timer.SECOND * 3 : Phaser.Timer.SECOND * 2;

        // Initialize controls
        this.cursors    = this.input.keyboard.createCursorKeys();
        this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Remove countdown
        this.interfaceCountdown.destroy();
        this.interfaceCountdownBox.destroy();
        this.interfaceCountdownLevel.destroy();

        this.interfaceCountdown      = null;
        this.interfaceCountdownBox   = null;
        this.interfaceCountdownLevel = null;
        
        // Create player
        this.addPlayer();
        
        // Config camera
        this.camera.follow(this.player);

        // Init fuel item
        this.time.events.add(Phaser.Timer.SECOND * 20, this.addItem, this, 'Fuel', true);

        // Init obstacle item
        this.time.events.add(this.rnd.between(Phaser.Timer.MINUTE / 4, Phaser.Timer.MINUTE / 2), this.addItem, this, 'Obstacle', true);

        // Init power item
        this.time.events.add(this.rnd.between(Phaser.Timer.MINUTE * 1.5, Phaser.Timer.MINUTE * 2), this.addItem, this, 'Power', true);

        // Init live item
        this.time.events.add(this.rnd.between(Phaser.Timer.MINUTE * 2, Phaser.Timer.MINUTE * 2.5), this.addItem, this, 'Life', true);

        // Add enemy listener
        this.listenerEnemies = this.time.events.loop(difficulty, this.addEnemy, this);

        difficulty = null;

    },

    quitGame: function (sound) {

        sound.stop();
        sound.destroy();
        sound = null;

        if (this.game.device.cocoonJS && this.level % 2 !== 0 && window.Cocoon && Cocoon.Ad && Cocoon.Ad.AdMob) {
            BasicGame.interstitial.show();
        }

        this.state.start('MainMenu');

    },

    gameOver: function () {

        var tween_bg  = {},
            sound     = this.add.audio('effectGameOver'),
            bmd       = this.add.bitmapData(this.camera.width, this.camera.height);

        // Save score
        BasicGame.score += this.levelScore;
        this.saveScore();

        // Clear score
        BasicGame.score = 0;

        // Stop game
        this.time.events.removeAll();
        this.mapBackground.stopScroll();
        this.music.stop();

        this.interfaceMute.alpha    = 0.4;
        this.interfacePause.alpha   = 0.4;

        if (this.game.device.touch) {
            this.add.tween(this.interfaceTouchControlsLeft).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 100);
            this.add.tween(this.interfaceTouchControlsRight).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 100);
            this.add.tween(this.interfaceTouchControlsJump).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 100);
        }

        // Box message
        bmd.ctx.fillStyle = '#b9b9b9';
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, bmd.width, (bmd.height * 20) / 100); 
        bmd.ctx.closePath();
        bmd.ctx.fill();

        // Interface
        this.interfaceGameOverBg = this.add.sprite(this.camera.x - this.camera.width, this.camera.y + this.camera.height / 3, bmd);
        this.interfaceGameOver   = this.add.sprite(this.camera.x + (this.camera.width / 2) - (this.game.cache.getFrameData('atlasGameScreen').getFrameByName('msg-gameover.png').width / 2), this.camera.y - 500, 'atlasGameScreen', 'msg-gameover.png');

        // Animations
        tween_bg = this.add.tween(this.interfaceGameOverBg).to({ 'x': this.camera.x }, 1000, Phaser.Easing.Exponential.Out, true);

        tween_bg.onComplete.add(function () {
            var tween_msg = this.add.tween(this.interfaceGameOver).to({ 'y': this.interfaceGameOverBg.y + 15 }, 1200, Phaser.Easing.Bounce.Out, true);

            tween_msg.onComplete.add(function () {
                var p       = this.add.sprite(this.camera.x, this.interfaceGameOverBg.y + 35, 'atlasGameScreen', 'player/0000.png'),
                    e       = this.add.sprite(this.camera.x + this.camera.width, this.interfaceGameOverBg.y + 35, 'atlasGameScreen', 'enemy-1/0000.png'),
                    tween_p = {},
                    tween_e = {};

                p.animations.add('run-right', Phaser.Animation.generateFrameNames('player/', 0, 3, '.png', 4), 15, true); 
                p.animations.add('dead-right', Phaser.Animation.generateFrameNames('player/', 10, 11, '.png', 4), 15, true); 
                e.animations.add('run-left', Phaser.Animation.generateFrameNames('enemy-1/', 22, 25, '.png', 4), 15, true); 
                e.animations.add('capture-left-front', Phaser.Animation.generateFrameNames('enemy-1/', 35, 35, '.png', 4), 1, false); 

                p.animations.play('run-right');
                e.animations.play('run-left');

                tween_p = this.add.tween(p).to({ 'x': this.camera.x + (this.camera.width / 2) - 30 }, 2000, Phaser.Easing.Linear.None, true);

                tween_p.onComplete.add(function () {
                    p.animations.play('dead-right');
                    p = tween_p = null;
                }, this);

                tween_e = this.add.tween(e).to({ 'x': this.camera.x + (this.camera.width / 2) + 25 }, 2000, Phaser.Easing.Linear.None, true);

                tween_e.onStart.add(function () {
                    sound.play();
                }, this);

                tween_e.onComplete.add(function () {
                    e.animations.play('capture-left-front');
                    e = tween_e = null;
                }, this);

                tween_msg = null;

            }, this);

            tween_bg = null;

        }, this);

        this.time.events.add(Phaser.Timer.SECOND * 9, this.quitGame, this, sound);

        bmd = null;

    },

    checkIfLevelCompleted: function () {

        var bmd       = {},
            tween_bg  = {};

        if (!this.levelCompleted && this.levelScore === this.levelCountTiles) {

            // Save score
            BasicGame.score += this.levelScore;

            // Stop game
            this.time.events.removeAll();
            this.mapBackground.stopScroll();
            this.music.stop();

            this.levelCompleted         = true;
            this.cursors                = null;
            this.jumpButton             = null;
            this.player.body.immovable  = true;
            this.player.body.velocity.x = 0;

            this.interfaceMute.alpha    = 0.4;
            this.interfacePause.alpha   = 0.4;

            if (this.game.device.touch) {
                this.add.tween(this.interfaceTouchControlsLeft).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 100);
                this.add.tween(this.interfaceTouchControlsRight).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 100);
                this.add.tween(this.interfaceTouchControlsJump).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 100);
            }

            // Box message
            bmd = this.add.bitmapData(this.camera.width, this.camera.height);

            bmd.ctx.fillStyle = '#b9b9b9';
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, bmd.width, (bmd.height * 20) / 100); 
            bmd.ctx.closePath();
            bmd.ctx.fill();

            // Interface
            this.interfaceLevelCompletedBg = this.add.sprite(this.camera.x - this.camera.width, this.camera.y + this.camera.height / 3, bmd);

            // Animations
            tween_bg = this.add.tween(this.interfaceLevelCompletedBg).to({ 'x': this.camera.x }, 1000, Phaser.Easing.Exponential.Out, true);
            
            tween_bg.onComplete.add(function () {
                var p         = this.add.sprite(this.camera.x, this.interfaceLevelCompletedBg.y + 30, 'atlasGameScreen', 'player/0000.png'),
                    e3        = this.add.sprite(this.camera.x - 128, this.interfaceLevelCompletedBg.y + 10, 'atlasGameScreen', 'enemy-3/0000.png'),
                    e2        = this.add.sprite(this.camera.x - 128, this.interfaceLevelCompletedBg.y + 30, 'atlasGameScreen', 'enemy-2/0000.png'),
                    e1        = this.add.sprite(this.camera.x - 128, this.interfaceLevelCompletedBg.y + 35, 'atlasGameScreen', 'enemy-1/0000.png'),
                    tween_msg = {},
                    tween_p   = {},
                    tween_e1  = {},
                    tween_e2  = {},
                    tween_e3  = {},
                    crop_rect = {};

                p.animations.add('run-right', Phaser.Animation.generateFrameNames('player/', 0, 3, '.png', 4), 15, true); 
                e3.animations.add('run-right', Phaser.Animation.generateFrameNames('enemy-3/', 0, 3, '.png', 4), 15, true); 
                e2.animations.add('run-right', Phaser.Animation.generateFrameNames('enemy-2/', 0, 3, '.png', 4), 15, true); 
                e1.animations.add('run-right', Phaser.Animation.generateFrameNames('enemy-1/', 0, 3, '.png', 4), 15, true); 

                p.animations.play('run-right');
                e3.animations.play('run-right');
                e2.animations.play('run-right');
                e1.animations.play('run-right');

                // Tween message
                this.interfaceLevelCompleted = this.add.sprite(this.camera.x + (this.camera.width / 2) - (this.game.cache.getFrameData('atlasGameScreen').getFrameByName('msg-levelcompleted.png').width / 2), this.interfaceLevelCompletedBg.y + 30, 'atlasGameScreen', 'msg-levelcompleted.png');

                crop_rect = new Phaser.Rectangle(0, 0, 0, this.interfaceLevelCompleted.height);

                tween_msg = this.add.tween(crop_rect).to({ 'width': this.interfaceLevelCompleted.width }, 4000, Phaser.Easing.Linear.None, false).delay(2000);
                tween_msg.start();

                this.interfaceLevelCompleted.crop(crop_rect);

                // Tween actors
                tween_p   = this.add.tween(p).to({ 'x': this.camera.x + this.camera.width }, 3000, Phaser.Easing.Linear.None, true);
                tween_e1  = this.add.tween(e1).to({ 'x': this.camera.x + this.camera.width }, 5000, Phaser.Easing.Linear.None, true);
                tween_e2  = this.add.tween(e2).to({ 'x': this.camera.x + this.camera.width }, 5200, Phaser.Easing.Linear.None, true);
                tween_e3  = this.add.tween(e3).to({ 'x': this.camera.x + this.camera.width }, 5100, Phaser.Easing.Linear.None, true);

                tween_e3.onStart.add(function () {
                    var sound = this.add.audio('effectLevelCompleted');
                    sound.play();
                    sound = null;
                }, this);

                tween_msg.onComplete.add(function () {
                    var bt_continue = this.add.button(this.camera.x + (this.camera.width / 2) - (this.game.cache.getFrameData('atlasGameScreen').getFrameByName('bt-continue/0000.png').width / 2), this.camera.y - 500, 'atlasGameScreen', this.loadNextLevel, this, 'bt-continue/0002.png', 'bt-continue/0001.png', 'bt-continue/0000.png');

                    p.destroy();
                    e3.destroy();
                    e2.destroy();
                    e1.destroy();

                    this.add.tween(bt_continue).to({ 'y': this.interfaceLevelCompletedBg.y }, 1200, Phaser.Easing.Bounce.Out, true);

                    tween_msg = this.add.tween(this.interfaceLevelCompleted).to({ 'y': this.camera.y + this.camera.height * 2 }, 1000, Phaser.Easing.Bounce.Out, true, 400);

                    tween_msg.onComplete.add(function () {
                        this.interfaceLevelCompleted.destroy();
                        this.interfaceLevelCompleted = null;
                        
                        bt_continue = tween_msg = null;
                    }, this);

                    p = e1 = e2 = e3 = tween_p = tween_e1 = tween_e2 = tween_e3 = crop_rect = null;

                }, this);

                tween_bg = null;

            }, this);
            
        }

        bmd = null;

    },

    checkToJump: function (type, actor) {

        var direction = (type === 'ceiling') ? [1,2,3,4] : [5,6,7,8],
            map       = this.map,
            layer     = this.mapLayerPlatforms,
            tile      = { 'x': layer.getTileX(actor.x), 'y': layer.getTileY(actor.y) - 5 },
            result    = false;

        if (map.getTile(tile.x, tile.y, 0) ||
            map.getTile(tile.x + (actor.facing * direction[0]), tile.y, 0) ||
            map.getTile(tile.x + (actor.facing * direction[1]), tile.y, 0) ||
            map.getTile(tile.x + (actor.facing * direction[2]), tile.y, 0) ||
            map.getTile(tile.x + (actor.facing * direction[3]), tile.y, 0)) {

            result = true;    
        }

        delete tile.x;
        delete tile.y;

        direction = map = layer = tile = null;

        return result;

    },

    loadNextLevel: function () {

        var nextLevel = this.level + 1;

        if (this.game.device.cocoonJS && nextLevel % 2 === 0 && window.Cocoon && Cocoon.Ad && Cocoon.Ad.AdMob) {
            BasicGame.interstitial.show();
        }

        if (nextLevel <= 12) {
            this.state.restart(true, false, nextLevel, this.lives);
        }
        else {
            this.state.start('GameEnd');
        }

        nextLevel = null;

    },

    countTilesOfTheLevel: function() {
        
        var result = 0;

        this.mapLayerPlatforms.layer.data.forEach(function (v) {
            v.forEach(function (tile) {
                if (tile.index > 0 && tile.index < 5) {
                    result++;
                }
            });
        });

        return result;

    },

    addInterface: function () {

        var format = function (num, size) {
                        var d = '0000000000000000' + num;
                        return d.substr(d.length - size);
                    };

        // Interface
        this.groupInterface = this.add.group();

        this.interfaceLife = this.add.sprite(10, 10, 'atlasGameScreen', 'life/0005.png');
        this.interfaceLife.fixedToCamera = true;
        this.interfaceLife.scale.setTo(0.6, 0.6);
        this.groupInterface.add(this.interfaceLife);

        this.interfaceFuel = this.add.sprite(this.camera.width / 2 - 125, 10, 'atlasGameScreen', 'fuel/0010.png');
        this.interfaceFuel.fixedToCamera = true;
        this.interfaceFuel.scale.setTo(0.6, 0.6);
        this.groupInterface.add(this.interfaceFuel);

        this.interfaceLevelScore = this.add.bitmapText(this.camera.width / 2 + 150, 13, 'munro', format(BasicGame.score, 7) + ' Km', 40);
        this.interfaceLevelScore.tint = 0x111111;
        this.interfaceLevelScore.fixedToCamera = true;
        this.interfaceLevelScore.anchor.setTo(0.5, 0.5);
        this.interfaceLevelScore.scale.setTo(0.6, 0.6);
        this.groupInterface.add(this.interfaceLevelScore);

        this.interfaceMute = this.add.button(this.camera.x + this.camera.width - 80, 10, 'atlasGameScreen', this.muteOnOff, this, 'bt-music-game/0000.png', 'bt-music-game/0001.png');
        this.interfaceMute.frameName = (BasicGame.music) ? 'bt-music-game/0000.png' : 'bt-music-game/0001.png';
        this.interfaceMute.fixedToCamera = true;
        this.interfaceMute.scale.setTo(0.6, 0.6);
        this.groupInterface.add(this.interfaceMute);

        this.interfaceMute.onInputOut.add(function () {
            this.interfaceMute.frameName = (BasicGame.music) ? 'bt-music-game/0000.png' : 'bt-music-game/0001.png';
        }, this);

        this.interfacePause = this.add.button(this.camera.x + this.camera.width - 40, 10, 'atlasGameScreen', this.pause, this, 'bt-pause/0000.png', 'bt-pause/0001.png');
        this.interfacePause.frameName = (!this.game.paused) ? 'bt-pause/0000.png' : 'bt-pause/0001.png';
        this.interfacePause.fixedToCamera = true;
        this.interfacePause.scale.setTo(0.6, 0.6);
        this.groupInterface.add(this.interfacePause);

        this.interfacePause.onInputOut.add(function () {
            this.interfacePause.frameName = (!this.game.paused) ? 'bt-pause/0000.png' : 'bt-pause/0001.png';
        }, this);

        this.updateLives();
        this.updateFuel();
        this.updateCountdown();

        // Add controls for mobile device
        if (this.game.device.touch) {
            this.addTouchControls();
        }

        format = null;

    },

    addTouchControls: function () {

        // Right
        this.interfaceTouchControlsRight = this.add.button(10, this.camera.height - 125, 'atlasGameScreen', this.tapController, this, 'bt-right/0002.png', 'bt-right/0001.png', 'bt-right/0000.png');
        this.interfaceTouchControlsRight.scale.setTo(0.8, 0.8);
        this.interfaceTouchControlsRight.alpha = 0.8;
        this.interfaceTouchControlsRight.fixedToCamera = true;
        this.interfaceTouchControlsRight.visible = false;
        this.groupInterface.add(this.interfaceTouchControlsRight);

        // Left
        this.interfaceTouchControlsLeft  = this.add.button(10, this.camera.height - 125, 'atlasGameScreen', this.tapController, this, 'bt-left/0002.png', 'bt-left/0001.png', 'bt-left/0000.png');
        this.interfaceTouchControlsLeft.scale.setTo(0.8, 0.8);
        this.interfaceTouchControlsLeft.alpha = 0.8;
        this.interfaceTouchControlsLeft.fixedToCamera = true;
        this.groupInterface.add(this.interfaceTouchControlsLeft);

        // Jump
        this.interfaceTouchControlsJump  = this.add.button(this.camera.width - 135, this.camera.height - 125, 'atlasGameScreen', this.tapController, this, 'bt-jump/0002.png', 'bt-jump/0001.png', 'bt-jump/0000.png');
        this.interfaceTouchControlsJump.scale.setTo(0.8, 0.8);
        this.interfaceTouchControlsJump.alpha = 0.8;
        this.interfaceTouchControlsJump.fixedToCamera = true;
        this.groupInterface.add(this.interfaceTouchControlsJump);

    },

    addPlayer: function () {

        this.player = new Player(this.game, 100, 650);

        this.groupActors.add(this.player);

        this.physics.enable(this.player, Phaser.Physics.ARCADE);

        this.player.body.collideWorldBounds = true;
        this.player.body.bounce.y = 0.3;
        this.player.body.height = this.player.body.halfHeight;

        this.player.run();

    },

    addEnemy: function () {

        var enemies  = this.groupActors.children.filter(function (child, index, children) {
                            return (child.name === 'enemy' && !child.alive);
                        }, true),
            enemy     = {},
            position  = this.getActorPosition();
        
        if (enemies.length > 0) {
            enemy = enemies.pop();
            enemy.reset(position.x, position.y);
        }
        else {
            enemy = new Enemy(this.game, position.x, position.y);

            this.groupActors.add(enemy);
            this.physics.enable(enemy, Phaser.Physics.ARCADE);

            enemy.body.collideWorldBounds = true;
            enemy.body.bounce.y = 0.2;
            enemy.body.height = enemy.body.halfHeight;
        }
        enemy.setFacing();
        enemy.setVelocity();
        enemy.run();

        delete position.x;
        delete position.y;

        enemies = enemy = position = null;

    },

    addTerrain: function (i, x, y) {

        this.bmdTerrain.draw(new Phaser.Image(this.game, 0, 0, 'atlasGameScreen', 'terrain-'+ this.resources +'-tile-'+ i +'.png'), x, y, 32, 32);

    },

    addItem: function (type, collision, image) {

        if (type === 'Life' && this.lives === 5) {
            return;
        }

        var position = this.getItemPosition(),
            item     = (typeof window[type] === 'function') ? new window[type](this.game, position.x, position.y, image) : null;

        if (item !== null) {
            this.groupActors.add(item);

            this.physics.enable(item, Phaser.Physics.ARCADE);

            item.body.bounce.y = 0.2;
            item.body.height = (collision) ? item.body.halfHeight : 0;
            item.body.immovable = true;
        }

        delete position.x;
        delete position.y;

        position = item = null;

    },
    
    setCountdown: function () {

        this.countdown--;

        this.updateCountdown(true);

        if (this.countdown === 1) {
            this.interfaceCountdownLevel.setText('GOOOO!');
            this.time.events.add(Phaser.Timer.SECOND, this.initGame, this);
        }
        else {
            this.time.events.add(Phaser.Timer.SECOND, this.setCountdown, this);
        }

    },

    getActorPosition: function () {

        var worldWidth    = this.map.widthInPixels,
            worldHeight   = this.map.heightInPixels,
            platformsY    = [this.player.body.y, worldHeight - 160, worldHeight - 352, worldHeight - 544, worldHeight - 736],
            position      = {
                                'x': (this.player.x >= 0 && this.player.x <= this.camera.width) ? 
                                        this.camera.x + this.camera.width + 32
                                     :
                                        (this.player.x >= worldWidth - this.camera.width && this.player.x <= worldWidth) ?
                                            this.camera.x - 32
                                        :
                                            (this.rnd.normal() < 0) ?
                                                this.camera.x + this.camera.width + 32
                                            :
                                                this.camera.x - 32,

                                'y': platformsY[Math.floor(Math.random() * Math.random() * Math.random() * platformsY.length)]
                            };

        worldWidth = worldHeight = platformsY = null;

        return position;

    },

    getItemPosition: function () {

        var worldWidth    = this.map.widthInPixels,
            worldHeight   = this.map.heightInPixels,
            platformsY    = [worldHeight - 160, worldHeight - 352, worldHeight - 544, worldHeight - 736],
            position      = {
                                'x':    (this.camera.x >= 0 && this.camera.x <= 1200) ?
                                            this.rnd.between(this.camera.x + this.camera.width + 128, worldWidth - 128)
                                        :
                                            (this.camera.x >= 5200 && this.camera.x <= worldWidth) ?
                                                this.rnd.between(128, this.camera.x - 128)
                                            :
                                                (this.rnd.normal() < 0) ?
                                                    this.rnd.between(this.camera.x + this.camera.width + 128, worldWidth - 128)
                                                :
                                                    this.rnd.between(128, this.camera.x - 128),

                                'y':    platformsY[this.rnd.between(0, 3)]
                            };

        worldWidth = worldHeight = platformsY = platformY = null;

        return position;

    },

    getSkyType: function () {

        if (this.level === 1 || this.level === 4 || this.level === 7 || this.level === 10) {
            return 1;
        }
        else if (this.level === 2 || this.level === 5 || this.level === 8 || this.level === 11) {
            return 2;
        }
        else if (this.level === 3 || this.level === 6 || this.level === 9 || this.level === 12) {
            return 3;
        }
        else {
            return this.rnd.between(1, 3);
        }

    },

    getMusic: function () {

        if (this.level === 1 || this.level === 5 || this.level === 9) {
            return 1;
        }
        else if (this.level === 2 || this.level === 6 || this.level === 10) {
            return 2;
        }
        else if (this.level === 3 || this.level === 7 || this.level === 11) {
            return 3;
        }
        else if (this.level === 4 || this.level === 8 || this.level === 12) {
            return 4;
        }
        else {
            return this.rnd.between(1, 4);
        }

    },

    updateCountdown: function (update) {

        if (update) {
            this.interfaceCountdown.frameName = (this.countdown > 3) ? 'countdown/0000.png' : (this.countdown === 3) ? 'countdown/0001.png' : (this.countdown === 1) ? 'countdown/0003.png' : 'countdown/0002.png';
        }
        else {
            this.interfaceCountdown = this.add.sprite(this.camera.x + this.camera.width / 2.5, this.camera.height + 30, 'atlasGameScreen', 'countdown/0000.png');
            this.interfaceCountdown.anchor.setTo(0, 0.5);
            this.interfaceCountdown.scale.setTo(0.6, 0.6);
            this.groupInterface.add(this.interfaceCountdown);

            this.interfaceCountdownBox = this.add.sprite(this.camera.x + this.camera.width / 2.1, this.interfaceCountdown.y + this.interfaceCountdown.height / 2 + 20, 'atlasGameScreen', 'countdown-level.png');
            this.interfaceCountdownBox.anchor.setTo(0.5, 0.5);
            this.interfaceCountdownBox.scale.setTo(0.6, 0.6);
            this.groupInterface.add(this.interfaceCountdownBox);

            this.interfaceCountdownLevel = this.add.bitmapText(this.interfaceCountdownBox.x - 65, this.interfaceCountdownBox.y - 30, 'munro', 'Level ' + this.level, 50);
            this.interfaceCountdownLevel.anchor.setTo(0, 0);
            this.groupInterface.add(this.interfaceCountdownLevel);
        }

    },

    updateTouchControls: function (byDefault) {

        if (this.game.device.touch) {
            this.interfaceTouchControlsLeft.visible  = (this.player.facing === 1 || byDefault) ? true : false;
            this.interfaceTouchControlsRight.visible = (this.player.facing === 1 || byDefault) ? false : true;
        }

    },

    updateScore: function (value) {

        var format = function (num, size) {
                        var d = '0000000000000000' + num;
                        return d.substr(d.length - size);
                    };

        this.levelScore += value;

        this.interfaceLevelScore.setText(format(BasicGame.score + this.levelScore, 7) + ' Km');

        format = null;

    },

    updateLives: function (value) {

        if (value === 'add') {
            this.lives++;
        }
        else if (value === 'subtract') {
            this.lives--;
        }

        this.interfaceLife.frameName = 'life/000'+ this.lives +'.png';

    },

    updateFuel: function (value) {

        var fuel = 0;

        if (value === 'add') {
            this.fuel = this.fuel + 100;

            if (this.fuel > 200) {
                this.fuel = 200;
            }
        }
        else if (value === 'subtract') {
            this.fuel = this.fuel - 0.09;

            if (this.fuel < 0) {
                this.player.kill();
            }
        }
        else {
            this.fuel = 200;
        }

        fuel = Math.round(this.fuel / 20);
        fuel = (fuel < 10) ? '000'+ fuel : '00'+ fuel;

        this.interfaceFuel.frameName = 'fuel/' + fuel + '.png';

        fuel = null;

    },

    saveScore: function () {

        var compare   = function (a, b) {
                            if (a.distance > b.distance) return -1;
                            if (a.distance < b.distance) return 1;
                            return 0;
                        },
            date      = new Date(),
            day       = date.getDate(),
            month     = date.getMonth() + 1,
            year      = date.getFullYear(),
            serial    = 'xxyxxyxx-xyxx-zdz-xxyx-xxyxxyxxyxxx',
            uuid      = serial.replace(/[xy]/g, function(c) {
                            var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;
                            return v.toString(16);
                        }),
            scores    = [],
            added     = false;

        // Date adjustments
        day   = (day < 10) ? '0' + day : day;
        month = (month < 10) ? '0' + month : month;
        year  = year.toString().substr(2, 2);

        store.forEach(function (key, val) {
            if (key.indexOf('score') !== -1) {
                scores.push(val);
            }
        });

        if (scores.length >= 0 && scores.length <= 8) {
            store.set('score-' + uuid, { 'id': uuid, 'level': this.level, 'distance': BasicGame.score, 'date': day + '/' + month + '/' + year });
        }
        else {
            scores.sort(compare);

            for (var i = 0, max = scores.length; i < max; i++) {
                if (BasicGame.score > scores[i].distance && i < 8) {
                    store.set('score-' + uuid, { 'id': uuid, 'level': this.level, 'distance': BasicGame.score, 'date': day + '/' + month + '/' + year });
                    added = true;
                    break;
                }
            }
            if (added && scores.length >= 8) {
                store.remove('store-' + scores[scores.length-1].id);
            }
        }

        compare = date = day = month = year = serial = uuid = scores = added = null;

    },

    collisionTile: function (player) {

        var currentTile = {},
            x           = this.mapLayerPlatforms.getTileX(player.x),
            y           = this.mapLayerPlatforms.getTileY(player.y) + 1;

        if (player.name === 'player') {
            currentTile = this.map.getTile(x, y, 0);
            
            if (currentTile) {
                this.updateFuel('subtract');

                if ((currentTile.index > 0 && currentTile.index < 5) && !currentTile.traveled) {
                    currentTile.traveled = true;

                    //this.map.putTile(currentTile.index + 4, currentTile.x, currentTile.y, 0);
                    //this.map.replace(currentTile.index, currentTile.index + 4, x, y, 1, 1, 0);

                    this.addTerrain(currentTile.index, currentTile.worldX, currentTile.worldY);

                    this.updateScore(1);
                    this.checkIfLevelCompleted();
                }
            }
        }

        tile = currentTile = x = y = null;

    },

    collisionItem: function (player, item) {

        // Animations
        /*
        if ((player.name === 'player' && !player.isRevived) && (item.name && item.name.search(/^(enemy|fuel|life|power)$/g))) {
            if (item.x > player.x) {
                player.animations.play((player.facing === 1) ? 'collision-right-front' : 'collision-left-back');
            }
            else {
                player.animations.play((player.facing === 1) ? 'collision-right-back' : 'collision-left-front');
            }
        }
        */

        // Behaviors
        if ((player.name === 'player' && !player.isRevived && player.power) && (item.name === 'enemy' && !item.isDesintegrated)) {
            item.desintegrate();
            player.run();
        }
        else if ((player.name === 'player' && !player.isRevived && !player.power) && item.name === 'enemy') {
            item.capturePlayer();
            player.kill();
        }
        else if ((player.name === 'player' && !player.isRevived) && item.name === 'fuel') {
            item.kill();
            player.run();
            this.updateFuel('add');
        }
        else if ((player.name === 'player' && !player.isRevived) && item.name === 'life') {
            item.kill();
            player.run();
            this.updateLives('add');
        }
        else if ((player.name === 'player' && !player.isRevived) && item.name === 'power') {
            item.kill();
            player.run();
            player.toPower();

            this.time.events.add(Phaser.Timer.SECOND * 15, player.toDisempower, player);
        }
        else if ((player.name === 'player' && !player.isRevived) && item.name === 'obstacle') {
            player.facing = player.facing * -1;
            player.run();
        }

    },

    onCollision: function (obj1, obj2) {

        if (obj1.name === 'player' && obj2.name !== 'player' && !this.levelCompleted) {
            // Player – Map
            this.collisionTile(obj1);
            // Player – Items (enemy, fuel, live, obstacle, power)
            this.collisionItem(obj1, obj2);
        }

    },

    muteOnOff: function () {

        if (!this.levelCompleted) {
            if (BasicGame.music) {
                BasicGame.music = false;
                this.music.stop();
                this.interfaceMute.frameName = 'bt-music-game/0001.png';
            }
            else {
                BasicGame.music = true;
                this.music.play('', 0, 1, true);
                this.interfaceMute.frameName = 'bt-music-game/0000.png';
            }
        }
        
    },

    pause: function () {

        if (!this.game.paused && !this.levelCompleted) {
            this.game.paused = true;
        }
        
    },

    onGamePause: function () {

        if (!this.levelCompleted) {
            this.music.pause();
            this.interfacePause.frameName = 'bt-pause/0001.png';
        }

    },

    onGameResume: function () {

        if (!this.levelCompleted) {
            this.music.resume();
            this.interfacePause.frameName = 'bt-pause/0000.png';
        }

    },

    tapController: function (button) {

        if (!this.levelCompleted && (this.player && this.player.alive) && (button.frameName.indexOf('bt-left') !== -1 || button.frameName.indexOf('bt-right') !== -1 || button.frameName.indexOf('bt-jump') !== -1)) {
            this.player.control(button.frameName);
        }

    }

};