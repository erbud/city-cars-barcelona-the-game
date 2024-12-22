var BasicGame = {
                    /* Here we've just got some global level vars that persist regardless of State swaps */
                    score: 0,

                    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
                    music: true,

                    /* Your game can check BasicGame.orientated in internal loops to know if it should pause or not */
                    orientated: false,

                    /* Ads */
                    interstitial: null,

                    /* Viewport size */
                    width: window.innerWidth,
                    height: window.innerHeight
                };

if (navigator.isCocoonJS) {
    cocoonjsphaser.utils.fixDOMParser();
}

window.onload = function () {
    // HORIZONTAL SCROLLING GAMES - The base height you choose to develop the game - will be used to initialize game scaling
    var devY = 480;

    //  Create your Phaser game and inject it into the game div.
    //  We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)
    //  We're using a game size of 1024 x 768 here, but you can use whatever you feel makes sense for your game of course.
    //var game = new Phaser.Game(BasicGame.width * window.devicePixelRatio, BasicGame.height * window.devicePixelRatio, Phaser.CANVAS, 'game', null, false, false);
    //var game = new Phaser.Game(BasicGame.SAFE_ZONE_WIDTH + extraWidth, BasicGame.SAFE_ZONE_HEIGHT + extraHeight, Phaser.CANVAS, 'game', null, false, false);
    var game = new Phaser.Game((devY / BasicGame.height) * BasicGame.width, devY, Phaser.CANVAS, 'game', null, false, false);
    
    //  Add the States your game has.
    //  You don't have to do this in the html, it could be done in your Boot state too, but for simplicity I'll keep it here.
    game.state.add('Boot', BasicGame.Boot);
    game.state.add('Preloader', BasicGame.Preloader);
    game.state.add('MainMenu', BasicGame.MainMenu);
    game.state.add('Game', BasicGame.Game);
    game.state.add('GameEnd', BasicGame.GameEnd);

    //  Now start the Boot state.
    game.state.start('Boot');
};

