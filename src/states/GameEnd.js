BasicGame.GameEnd = function (game) {

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

    this.counterEnemies = 0;

    this.groupInterface;
    this.interfacePause;
    this.vignettesBg;
    /*this.vignettesBg2;
    this.vignettesCar;
	this.vignettesEnemiesBg;
	this.vignettesEnemies1;
	this.vignettesEnemies2;
	this.vignettesEnemies3;
	this.vignettesText1;
	this.vignettesText2;
	this.vignettesText3;*/
    this.vignettesMsg;

    this.listenerEnemies;

};

BasicGame.GameEnd.prototype = {

    init: function () {

        this.counterEnemies = 0;

    },

	preload: function (game) {

		// Map level
        game.load.tilemap('mapLevel', 'assets/tilemaps/maps/tilemap-10.json', null, Phaser.Tilemap.TILED_JSON);

        // Map audio
        game.load.audio('musicLevel', 'assets/audio/single-1.ogg');

        // Map assets
        game.load.image('mapBackground', 'assets/img/bg-4.png');
        game.load.image('mapSky', 'assets/img/bg-4-sky-3.png');
        game.load.image('tilesTerrain', 'assets/tilemaps/tiles/terrain-4.png');

        // Sprites vignettes
        game.load.atlasJSONHash('atlasEndScreen', 'assets/img/atlas-end.png', 'assets/data/atlas-end.json');

	},

	create: function (game) {

        var p       = {},
            tween_p = {};

		// Background
        this.mapSky        = this.add.tileSprite(0, 0, 6500, 768, 'mapSky');
        this.mapBackground = this.add.tileSprite(0, 225, 6500, 768, 'mapBackground');

        // Level map
        this.map = this.add.tilemap('mapLevel');
        this.map.addTilesetImage('terrain', 'tilesTerrain');
        this.mapLayerPlatforms = this.map.createLayer(0);
        this.mapLayerPlatforms.resizeWorld();

		// Interface
        this.groupInterface = this.add.group();

		// Pause
		this.interfacePause = this.add.button((this.camera.x + this.camera.width) - 60, 10, 'atlasGameScreen', this.pause, this, 'bt-pause/0000.png', 'bt-pause/0001.png');
        this.interfacePause.frameName = 'bt-pause/0000.png';
        this.interfacePause.fixedToCamera = true;
        this.groupInterface.add(this.interfacePause);

        this.interfacePause.onInputOut.add(function () {
            this.interfacePause.frameName = (!game.paused) ? 'bt-pause/0000.png' : 'bt-pause/0001.png';
        }, this);

        // Actors
        p       = this.add.sprite(-64, 690, 'atlasGameScreen', 'player/0000.png');
		tween_p = {};

        p.animations.add('run-right', Phaser.Animation.generateFrameNames('player/', 0, 3, '.png', 4), 15, true);
        p.animations.play('run-right');

        tween_p = this.add.tween(p).to({ 'x': this.camera.width }, 4000, Phaser.Easing.Linear.None, true, 1000);

	    tween_p.onStart.add(function () {
	        this.listenerEnemies = this.time.events.loop(300, this.addEnemy, this);
	    }, this);
	    tween_p.onComplete.add(function () {
	    	p.destroy();
	        p = tween_p = null;
	    }, this);

        // Initialize camera
        this.camera.focusOnXY(200, 690);

        // Play Music
        this.music = this.add.audio('musicLevel');
        
        if (BasicGame.music) {
            this.music.play('', 0, 1, false);
        }

        // Events
        game.onPause.add(this.onGamePause, this);
        game.onResume.add(this.onGameResume, this);

        game.input.onDown.add(function () {
            game.paused = false;
        }, this);

	},

	update: function (game) {

	},

	shutdown: function (game) {

		this.map.destroy();
        this.mapLayerPlatforms.destroy();
        this.mapBackground.destroy();
        this.mapSky.destroy();
        this.music.destroy();

        this.groupInterface.destroy();
        this.vignettesBg.destroy();
        /*this.vignettesBg2.destroy();
        this.vignettesCar.destroy();
        this.vignettesEnemiesBg.destroy();
        this.vignettesEnemies1.destroy();
        this.vignettesEnemies2.destroy();
        this.vignettesEnemies3.destroy();
        this.vignettesText1.destroy();
        this.vignettesText2.destroy();
        this.vignettesText3.destroy();*/
        this.vignettesMsg.destroy();

        // Clear assets
        this.cache.removeTilemap('mapLevel');
        this.cache.removeSound('musicLevel');
        this.cache.removeImage('mapBackground');
        this.cache.removeImage('mapSky');
        this.cache.removeImage('tilesTerrain');

	},



	quitGame: function () {

        this.music.stop();

        this.state.start('MainMenu');

    },

    addEnemy: function () {

    	var s       = 'enemy-' + this.game.rnd.between(1, 2),
            e 		= this.add.sprite(-75, 690, 'atlasGameScreen', s + '/0000.png'),
    		tween_e = {};

    	e.animations.add('run-right', Phaser.Animation.generateFrameNames(s +'/', 0, 3, '.png', 4), 15, true);        
    	e.animations.play('run-right');

    	tween_e = this.add.tween(e).to({ 'x': this.camera.width }, this.game.rnd.between(4500, 5500), Phaser.Easing.Linear.None, true, (this.counterEnemies === 0) ? 1000 : this.game.rnd.between(100, 300));

	    tween_e.onComplete.add(function () {
	    	e.destroy();
	        s = e = tween_e = null;
	    }, this);

	    if (this.counterEnemies > 60) {
	    	this.time.events.remove(this.listenerEnemies);
	    	this.time.events.add(1500, this.startVignettes, this);
	    }
	    else {
	    	this.counterEnemies++;
	    }

	},

	startVignettes: function () {

        var /*t         = this,*/
            bmd 	  = this.add.bitmapData(this.camera.width, this.camera.height),
        	tween_bg  = {},
            tween_msg = {};

        // Box message
        bmd.ctx.fillStyle = '#000000';
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, bmd.width, bmd.height);
        bmd.ctx.closePath();
        bmd.ctx.fill();

        /*this.vignettesBg1 		= this.add.sprite(0, bmd.height * -1, bmd);
        this.vignettesCar       = this.add.sprite((this.camera.width / 2) - (this.game.cache.getFrameData('atlasEndScreen').getFrameByName('end-car.png').width / 2) + ((this.camera.width * 25) / 100), 200, 'atlasEndScreen', 'end-car.png');
		this.vignettesEnemiesBg = this.add.sprite((this.camera.width / 2) - (this.game.cache.getFrameData('atlasEndScreen').getFrameByName('end-enemy-bg.png').width / 2) - ((this.camera.width * 25) / 100), this.camera.y, 'atlasEndScreen', 'end-enemy-bg.png');
		this.vignettesEnemies1  = this.add.sprite((this.vignettesEnemiesBg.width / 2) - (this.game.cache.getFrameData('atlasEndScreen').getFrameByName('end-enemy-1.png').width / 2) + (this.vignettesEnemiesBg.width * 25 / 100), this.game.cache.getFrameData('atlasEndScreen').getFrameByName('end-enemy-1.png').height * -1, 'atlasEndScreen', 'end-enemy-1.png');
		this.vignettesEnemies2  = this.add.sprite((this.vignettesEnemiesBg.width / 2) - (this.game.cache.getFrameData('atlasEndScreen').getFrameByName('end-enemy-2.png').width / 2), this.game.cache.getFrameData('atlasEndScreen').getFrameByName('end-enemy-2.png').height * -1, 'atlasEndScreen', 'end-enemy-2.png');
		this.vignettesEnemies3  = this.add.sprite((this.vignettesEnemiesBg.width / 2) - (this.game.cache.getFrameData('atlasEndScreen').getFrameByName('end-enemy-3.png').width / 2), this.game.cache.getFrameData('atlasEndScreen').getFrameByName('end-enemy-3.png').height * -1, 'atlasEndScreen', 'end-enemy-3.png');*/
        this.vignettesBg        = this.add.sprite(0, bmd.height * -1, bmd);
        this.vignettesMsg       = this.add.sprite(this.camera.x + (this.camera.width / 2) - (this.game.cache.getFrameData('atlasEndScreen').getFrameByName('end-msg.png').width / 2), bmd.height * -1, 'atlasEndScreen', 'end-msg.png');

        tween_bg  = this.add.tween(this.vignettesBg).to({ 'y': this.camera.y }, 2000, Phaser.Easing.Bounce.Out, true, 5000),
        tween_msg = this.add.tween(this.vignettesMsg).to({ 'y': this.camera.y + this.camera.height / 2 }, 2000, Phaser.Easing.Bounce.Out, true, 5000);
                            
        tween_bg.onComplete.add(function () {
            this.time.events.add(Phaser.Timer.SECOND * 3, this.quitGame, this);
            bmd = tween_bg = tween_msg = null;
        }, this);

        /*this.vignettesCar.alpha       = 0;
        this.vignettesEnemiesBg.alpha = 0;

        tween_bg = this.add.tween(this.vignettesBg1).to({ 'y': this.camera.y }, 2000, Phaser.Easing.Bounce.Out, true, 3000);
        
        tween_bg.onComplete.add(function () {
        	var tween_enemy_bg = this.add.tween(this.vignettesEnemiesBg).to({ 'alpha': 1 }, 2000, Phaser.Easing.Exponential.Out, true);

	        tween_enemy_bg.onComplete.add(function () {
	        	var tween_enemy_enemy1 = this.add.tween(this.vignettesEnemies1).to({ 'y': (this.vignettesEnemiesBg.height / 2) - 50 }, 2000, Phaser.Easing.Bounce.Out, true),
	                tween_enemy_enemy2 = this.add.tween(this.vignettesEnemies2).to({ 'y': (this.vignettesEnemiesBg.height / 2) + 75 }, 2000, Phaser.Easing.Bounce.Out, true, 1000),
	                tween_enemy_enemy3 = this.add.tween(this.vignettesEnemies3).to({ 'y': (this.vignettesEnemiesBg.height / 2) - 100 }, 2000, Phaser.Easing.Bounce.Out, true, 2000);

                tween_enemy_enemy3.onComplete.add(function () {

                	this.vignettesText1 = this.add.bitmapText(this.camera.width / 2, 25, 'munro', '_', 30);
				    this.vignettesText1.fixedToCamera = true;

                	this.setMsgText(this.vignettesText1, 'They have been unable to catch you...', function () {
                        var tween_car = t.add.tween(t.vignettesCar).to({ 'alpha': 1 }, 1000, Phaser.Easing.Linear.None, true);

                        tween_car.onComplete.add(function () {
                            t.vignettesText2 = t.add.bitmapText(t.vignettesEnemiesBg.x + ((t.vignettesEnemiesBg.width * 20) / 100), t.vignettesEnemiesBg.height + 60, 'munro', '_', 30);
                            t.vignettesText2.fixedToCamera = true;

                            t.setMsgText(t.vignettesText2, 'You have successfully escaped', function () {
                                t.vignettesText3 = t.add.bitmapText(t.vignettesText2.width / 1.5, t.vignettesText2.y + 35, 'munro', '_', 30);
                                t.vignettesText3.fixedToCamera = true;

                                t.setMsgText(t.vignettesText3, 'WELL DONE!!!', function () {
                                    var tween_bg  = t.add.tween(t.vignettesBg2).to({ 'y': t.camera.y }, 2000, Phaser.Easing.Bounce.Out, true, 5000),
                                        tween_msg = t.add.tween(t.vignettesMsg).to({ 'y': t.camera.height / 2 }, 2000, Phaser.Easing.Bounce.Out, true, 5000);

                                    tween_bg.onStart.add(function () {
                                        t.vignettesText1.visible = false;
                                        t.vignettesText2.visible = false;
                                        t.vignettesText3.visible = false;
                                    }, t);
                                                        
                                    tween_bg.onComplete.add(function () {
                                        this.time.events.add(Phaser.Timer.SECOND * 3, this.quitGame, this);

                                        t = tween_bg = tween_msg = null;
                                    }, t);
                                });
                            });

                            tween_car = null;

                        }, t);
                    });

                    tween_enemy_enemy1 = tween_enemy_enemy2 = tween_enemy_enemy3 = null;

                }, this);

               	tween_enemy_bg = null;

	        }, this);

	        bmd = tween_bg = null;
	    }, this);
        */

    },

    setMsgText: function (bmt, txt, callback, chr) {

    	var chr = chr || 1;

    	if (txt.length >= chr) {
    		bmt.setText(txt.substring(0, chr) + '_');

    		this.time.events.add(100, this.setMsgText, this, bmt, txt, callback, chr + 1);
    	}
        else {
        	bmt.setText(txt.substring(0, chr));

            if (typeof callback === 'function') {
                callback();
            }
        }

        chr = null;

    },

    pause: function () {

        if (!this.game.paused) {
            this.game.paused = true;
        }
        
    },

    onGamePause: function () {

        this.music.pause();
        this.interfacePause.frameName = 'bt-pause/0001.png';

    },

    onGameResume: function () {

        this.music.resume();
        this.interfacePause.frameName = 'bt-pause/0000.png';

    }

};