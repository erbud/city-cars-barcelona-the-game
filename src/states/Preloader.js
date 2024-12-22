BasicGame.Preloader = function (game) {

	this.bg  		 = null;
	this.preloadBar  = null;
	//this.message 	 = null;

	this.ready 		 = false;

};

BasicGame.Preloader.prototype = {

	preload: function (game) {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.bg   		  = this.add.sprite(game.world.centerX, game.world.centerY, 'preloaderBackground');
		this.preloaderBar = this.add.sprite(game.world.centerX, game.world.centerY + 25, 'preloaderBar');
		//this.message      = this.add.bitmapText(game.world.centerX, game.world.centerY, 'munro', 'Tribute to City Connection by Jaleco (1985)', 30);

		this.bg.anchor.setTo(0.5, 0.5);
		this.bg.scale.setTo(0.5, 0.5);
		this.preloaderBar.anchor.setTo(0.5, 0.5);
		this.preloaderBar.scale.setTo(0.5, 0.5);

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloaderBar);

		//	Here we load the rest of the assets our game needs.
		this.load.audio('music', 'assets/audio/single-main.ogg');
		this.load.audio('play', 'assets/audio/car-ignition.ogg');
		
		this.load.atlasJSONHash('atlasTitleScreen', 'assets/img/atlas-title.png', 'assets/data/atlas-title.json');
		this.load.atlasJSONHash('atlasGameScreen', 'assets/img/atlas-main.png', 'assets/data/atlas-main.json');

        // Load Ads
	    if (window.Cocoon && Cocoon.Ad && Cocoon.Ad.AdMob) {
        	document.addEventListener('deviceready', this.initAdMob, false);
    	}
	},

	create: function (game) {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloaderBar.cropEnabled = false;

	},

	shutdown: function (game) {

		this.bg.destroy();
		this.preloaderBar.destroy();
		//this.message.destroy();

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		if (this.cache.isSoundDecoded('music') && !this.ready) {
			this.ready = true;
			this.state.start('MainMenu');
		}

	},


	initAdMob: function () {

		Cocoon.Ad.AdMob.configure({
		    ios: {
		        interstitial: "ca-app-pub-8207893819001454/7443109524",
		        interstitialIpad: "ca-app-pub-8207893819001454/8919842724"
		    },
		    android: {
		        interstitial: "ca-app-pub-8207893819001454/4489643128"
		    }
		});

		BasicGame.interstitial = Cocoon.Ad.AdMob.createInterstitial();

		BasicGame.interstitial.on('fail', function () {
            BasicGame.interstitial.load();
        });
        BasicGame.interstitial.on('show', function () {
            game.paused  = true;
        });
        BasicGame.interstitial.on('dismiss', function () {
            game.paused  = false;
        });

		BasicGame.interstitial.load();

    }

};