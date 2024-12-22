BasicGame.MainMenu = function (game) {

	this.bg      = {};
	this.btPlay  = {};
	this.btWeb   = {};
	this.btInfo  = {};
	this.btScore = {};
	this.btMusic = {};
	this.music   = {};

	this.scoresTxt;
	this.scoresBg;

	this.creditsTxt;
	this.creditsBg;
	
};

BasicGame.MainMenu.prototype = {

	preload: function (game) {

	},

	create: function (game) {

    	var road       = {},
    		car        = {},
			tween1_car = {};

		// Resize scene
		game.world.width = game.camera.width;
		game.world.height = game.camera.height;

		// Set bakcground
		this.bg = this.add.sprite(game.world.centerX, game.world.centerY, 'atlasTitleScreen', 'main-bg.png'),
		this.bg.anchor.setTo(0.5, 0.5);
		this.bg.scale.setTo(0.5, 0.5);

		// Config elements
		road = this.add.sprite(this.bg.x - this.bg.width / 2, this.bg.y + this.bg.height / 2, 'atlasTitleScreen', 'main-road.png'),
		car  = this.add.sprite(-500, road.y + this.bg.height / 2, 'atlasTitleScreen', 'main-car.png'),
		
		road.anchor.setTo(0, 1);
		car.anchor.setTo(0.5, 1);
		
		road.scale.setTo(0.5, 0.5);
		car.scale.setTo(0.5, 0.5);

		// Play Music
		this.music = this.add.audio('music');
		
		if (BasicGame.music) {
        	this.music.play('', 0, 1, true);
        }

        // Transition animations
		tween1_car = this.add.tween(car).to({ 'x': road.x + road.width / 2.5, 'y': this.bg.y }, 1500, Phaser.Easing.Exponential.Out, true);

		tween1_car.onComplete.add(function () {
			var car_shadow 	  = this.add.sprite(road.x + road.width / 2.5, road.y - road.height + 5, 'atlasTitleScreen', 'main-car-shadow.png'),
				tween2_car 	  = this.add.tween(car).to({ 'y': road.y - road.height / 1.2 }, 1500, Phaser.Easing.Bounce.Out, true),
				tween_shadow  = this.add.tween(car_shadow).to({ 'alpha': 1 }, 1500, Phaser.Easing.Bounce.Out, false);

			car_shadow.anchor.setTo(0.5, 0);
			car_shadow.scale.setTo(0.5, 0.5);

			car_shadow.alpha = 0;
			tween_shadow.start();

			tween2_car.onComplete.add(function () {
				var title 		  = this.add.sprite(this.bg.x + 25, this.bg.y + this.bg.height, 'atlasTitleScreen', 'main-title.png'),
					tween_title   = this.add.tween(title).to({ 'y': this.bg.y - this.bg.height / 2 }, 250, Phaser.Easing.Linear.None, true);

				title.scale.setTo(0.5, 0.5);

				tween_title.onComplete.add(function () {
					var logo_zdz    = this.add.sprite(title.x + title.width / 2.6, this.bg.height + 30, 'atlasTitleScreen', 'main-logo-zdz.png'),
						tween_play  = {},
						tween_web   = {},
						tween_score = {},
						tween_info  = {},
						tween_mute  = {};

					logo_zdz.scale.setTo(0.5, 0.5);

					this.btPlay 	  	   = this.add.button(title.x + title.width / 3, title.height / 1.25, 'atlasGameScreen', this.startGame, this, 'bt-play/0002.png', 'bt-play/0001.png', 'bt-play/0000.png'),
					this.btPlay.alpha 	   = 0;

					this.btWeb 	  	  	   = this.add.button(road.x + 10, this.bg.height, 'atlasGameScreen', this.openWeb, this, 'bt-web/0000.png', 'bt-web/0001.png');
					this.btWeb.alpha  	   = 0;

					this.btScore 	       = this.add.button(this.btWeb.x + this.btWeb.width / 2, this.bg.height, 'atlasGameScreen', this.scores, this, 'bt-score/0000.png', 'bt-score/0001.png');
					this.btScore.alpha 	   = 0;
					this.btScore.frameName = 'bt-score/0001.png';

					this.btScore.onInputOut.add(function () {
						this.btScore.frameName = (this.scoresBg) ? 'bt-score/0000.png' : 'bt-score/0001.png';
					}, this);

					this.btInfo 	  	   = this.add.button(this.btScore.x + this.btScore.width / 2, this.bg.height, 'atlasGameScreen', this.credits, this, 'bt-info/0000.png', 'bt-info/0001.png');
					this.btInfo.alpha 	   = 0;
					this.btInfo.frameName  = 'bt-info/0001.png';

					this.btInfo.onInputOut.add(function () {
						this.btInfo.frameName = (this.creditsBg) ? 'bt-info/0000.png' : 'bt-info/0001.png';
					}, this);

					this.btMusic 	  	   = this.add.button(this.btInfo.x + this.btInfo.width / 2, this.bg.height, 'atlasGameScreen', this.muteOnOff, this, 'bt-music/0000.png', 'bt-music/0001.png');
					this.btMusic.alpha 	   = 0;
					this.btMusic.frameName = (BasicGame.music) ? 'bt-music/0000.png' : 'bt-music/0001.png';

					this.btMusic.onInputOut.add(function () {
						this.btMusic.frameName = (BasicGame.music) ? 'bt-music/0000.png' : 'bt-music/0001.png';
					}, this);

					this.btPlay.scale.setTo(0.5, 0.5);
					this.btWeb.scale.setTo(0.5, 0.5);
					this.btScore.scale.setTo(0.5, 0.5);
					this.btInfo.scale.setTo(0.5, 0.5);
					this.btMusic.scale.setTo(0.5, 0.5);

					tween_web   = this.add.tween(this.btWeb).to({ 'alpha': 1 }, 1500, Phaser.Easing.Exponential.Out, true, 1000);
				    tween_score = this.add.tween(this.btScore).to({ 'alpha': 1 }, 1500, Phaser.Easing.Exponential.Out, true, 1250);
					tween_info  = this.add.tween(this.btInfo).to({ 'alpha': 1 }, 1500, Phaser.Easing.Exponential.Out, true, 1500);
					tween_mute  = this.add.tween(this.btMusic).to({ 'alpha': 1 }, 1500, Phaser.Easing.Exponential.Out, true, 1750);
					tween_play  = this.add.tween(this.btPlay).to({ 'alpha': 1 }, 1500, Phaser.Easing.Exponential.Out, true, 2000);

					tween_play.onComplete.add(function () {
						car = car_shadow = road = title = tween1_car = tween2_car = tween_shadow = tween_title = tween_web = tween_score = tween_info = tween_mute = tween_play = null;
					}, this);

				}, this);
		    	
			}, this);

		}, this);

	},

	update: function (game) { },

	shutdown: function (game) {

		this.btPlay.destroy();
		this.btWeb.destroy();
		this.btInfo.destroy();
		this.btMusic.destroy();
		this.music.destroy();

		if (this.scoresBg) {
			this.scoresBg.destroy();
			this.scoresTxt.destroy();
		}
		if (this.creditsBg) {
			this.creditsBg.destroy();
			this.creditsTxt.destroy();
		}

		this.btPlay     = null;
		this.btWeb      = null;
		this.btInfo     = null;
		this.btMusic    = null;
		this.music      = null;
		this.scoresBg   = null;
		this.scoresTxt  = null;
		this.creditsBg  = null;
		this.creditsTxt = null;

	},



	muteOnOff: function () {

		if (BasicGame.music) {
			BasicGame.music = false;
			this.music.stop();
			this.btMusic.frameName = 'bt-music/0001.png';
		}
		else {
			BasicGame.music = true;
			this.music.play('', 0, 1, true);
			this.btMusic.frameName = 'bt-music/0000.png';
		}
		
	},

	openWeb: function (button) {

		if (this.game.device.cocoonJS) {
	        Cocoon.App.openURL('http://www.zdzapps.com');
	    }
	    else {
	        window.open('http://www.zdzapps.com');
	    }

	},

	startGame: function (button) {

		var audio       = this.add.audio('play'),
			tween_play  = this.add.tween(this.btPlay).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 100),
	    	tween_web   = this.add.tween(this.btWeb).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 200),
	    	tween_score = this.add.tween(this.btScore).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 300),
	    	tween_info  = this.add.tween(this.btInfo).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 400),
	    	tween_mute  = this.add.tween(this.btMusic).to({ 'y': this.camera.height }, 1000, Phaser.Easing.Bounce.Out, true, 500);

        audio.onStop.add(function () {
        	this.state.start('Game');
        }, this);

        this.music.stop();
        audio.play();

		audio = tween_play = tween_web = tween_score = tween_info = tween_mute = null;

	},

	scores: function (button) {
		
		var format    = function (num, size) {
	                        var d = '0000000000000000' + num;
	                        return d.substr(d.length - size);
	                    },
	        compare   = function (a, b) {
                            if (a.distance > b.distance) return -1;
                            if (a.distance < b.distance) return 1;
                            return 0;
                        },
			position  = {
							'x': this.bg.x + 25,
							'y': this.bg.y - this.bg.height * 2
						},
			tween_bg  = {},
			tween_txt = {},
			bmd   	  = {},
			scores    = [],
			txt   	  = [
							'\n\n',
							'\nCITY CARS – BARCELONA\n',
							'\nHIGH SCORES\n\n\n',
							'\nLEVEL  DISTANCE        DATE    \n'
						];

		// Ranking
		store.forEach(function (key, val) {
            if (key.indexOf('score') !== -1) {
                scores.push(val);
            }
        });

	 	if (scores.length === 0) {
			txt.push('\n      ...       ...                 ...               \n');
		}
		else {
			scores.sort(compare);

			for (var i = 0, max = (scores.length < 8) ? scores.length : 8; i < max; i++) {
				txt.push('\n    '+scores[i].level+'      '+format(scores[i].distance, 7)+' Km   '+scores[i].date+'    \n');
			}
		}
		txt = txt.join('');

		// Interface
		if (this.creditsBg || this.creditsTxt) {
			this.credits();
		}

        if (!this.scoresBg || !this.scoresTxt) {
        	bmd = new Phaser.BitmapData(this.game, 'bmd', this.bg.width, this.bg.height);

	        bmd.ctx.fillStyle = 'black';
	        bmd.ctx.beginPath();
	        bmd.ctx.rect(0, 0, bmd.width, bmd.height); 
	        bmd.ctx.closePath();
	        bmd.ctx.fill();
	        
        	this.scoresBg  = this.add.sprite(position.x, position.y, bmd);
        	this.scoresTxt = this.add.bitmapText(position.x, position.y, 'munro', txt, 12);

        	this.scoresTxt.anchor.setTo(0, 0);
        	this.scoresTxt.width = this.bg.width / 2 - 20;
        	this.scoresTxt.align = 'center';

        	tween_bg  = this.add.tween(this.scoresBg).to({ 'y': this.bg.y - this.bg.height / 2 }, 1000, Phaser.Easing.Bounce.Out, true);
			tween_txt = this.add.tween(this.scoresTxt).to({ 'y': this.bg.y - this.bg.height / 2 }, 1000, Phaser.Easing.Bounce.Out, true);

			tween_bg.onComplete.add(function () {
		    	this.btScore.frameName = 'bt-score/0000.png';
		    	tween_bg = tween_txt = null;
			}, this);
        }
        else {
        	tween_bg  = this.add.tween(this.scoresBg).to({ 'y': position.y }, 1000, Phaser.Easing.Bounce.Out, true);
			tween_txt = this.add.tween(this.scoresTxt).to({ 'y': position.y }, 1000, Phaser.Easing.Bounce.Out, true);

			tween_bg.onComplete.add(function () {
		    	this.btScore.frameName = 'bt-score/0001.png';
		    	tween_bg = tween_txt = null;

	    		if (this.scoresBg) { this.scoresBg.destroy(); }
	    		if (this.scoresTxt) { this.scoresTxt.destroy(); }

	    		this.scoresBg = null;
	    		this.scoresTxt = null;
			}, this);
        }

		delete position.x;
        delete position.y;

		format = compare = position = bmd = scores = txt =  null;

	},

	credits: function (button) {

		var tween_bg  = {},
			tween_txt = {},
			bmd   	  = {},
			position  = {
							'x': this.bg.x + 25,
							'y': this.bg.y - this.bg.height * 2
						},
			txt   	  = [
							'\nORIGINAL IDEA\n',
							'Jaleco (1985)\n',
							'\nGRAPHICS AND DEVELOPMENT\n',
							'ZDZ Touch & Play (zdzapps.com)\n',
							'\nGAME ENGINE\n',
							'Phaser by PhotonStorm.com\n',
							'\nLEVEL MAPS\n',
							'Tiled by MapEditor.org\n',
							'\nPACKAGER AND RENDERING\n',
							'CocoonJS by Ludei.com\n',
							'\nAUDIO ENCODING\n',
							'Ogg Vorbis\n',
							'\nMUSIC BY Paltian.com\n',
							'Waiting\n',
							'Ready!\n',
							'The race\n',
							'Blue & White\n',
							'Freedom!'
						].join('');

		if (this.scoresBg || this.scoresTxt) {
			this.scores();
		}

        if (!this.creditsBg || !this.creditsTxt) {
        	bmd = new Phaser.BitmapData(this.game, 'bmd', this.bg.width, this.bg.height);

	        bmd.ctx.fillStyle = 'black';
	        bmd.ctx.beginPath();
	        bmd.ctx.rect(0, 0, bmd.width, bmd.height); 
	        bmd.ctx.closePath();
	        bmd.ctx.fill();
	        
        	this.creditsBg  = this.add.sprite(position.x, position.y, bmd);
        	this.creditsTxt = this.add.bitmapText(position.x + 20, position.y, 'munro', txt, 15);

        	tween_bg  = this.add.tween(this.creditsBg).to({ 'y': this.bg.y - this.bg.height / 2 }, 1000, Phaser.Easing.Bounce.Out, true);
			tween_txt = this.add.tween(this.creditsTxt).to({ 'y': this.bg.y - this.bg.height / 2 }, 1000, Phaser.Easing.Bounce.Out, true);

			tween_bg.onComplete.add(function () {
				this.btInfo.frameName = 'bt-info/0000.png';
	        	tween_bg = tween_txt = null;
			}, this);
        }
        else {
        	tween_bg  = this.add.tween(this.creditsBg).to({ 'y': position.y }, 1000, Phaser.Easing.Bounce.Out, true);
			tween_txt = this.add.tween(this.creditsTxt).to({ 'y': position.y }, 1000, Phaser.Easing.Bounce.Out, true);

	        tween_bg.onComplete.add(function () {
	        	this.btInfo.frameName = 'bt-info/0001.png';
	        	tween_bg = tween_txt = null;

        		if (this.creditsBg) { this.creditsBg.destroy(); }
        		if (this.creditsTxt) { this.creditsTxt.destroy(); }

        		this.creditsBg = null;
        		this.creditsTxt = null;
			}, this);
        }

		delete position.x;
        delete position.y;

		bmd = position = txt = null;

	}

};