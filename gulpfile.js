// Include gulp and plugins
var fs 	   = require('fs-extra'),
	gulp   = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename');


// Concatenate JS Files
gulp.task('scripts', function() {
    return gulp.src([
	    'src/*.js',
	    'src/api/*.js',
	    'src/states/*.js',
	    'src/actors/*.js',
	    'src/items/*.js'
      ])
      .pipe(concat('game.js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('build/'));
});

// Watch for changes in files
gulp.task('watch', function() {
	// Watch .js files
	gulp.watch([
	    'src/*.js',
	    'src/api/*.js',
	    'src/states/*.js',
	    'src/actors/*.js',
	    'src/items/*.js'
    ], ['scripts']);
});

gulp.task('default', ['scripts', 'watch']);


// Create package to native compile
gulp.watch('build/*.js', function (event) {
	// Copy release files
	fs.copy('./build', './___native/www/build', function (err) {
	  	if (err) return console.error(err);
	  	console.log("build success!");
	});

	fs.copy('./assets', './___native/www/assets', function (err) {
	  	if (err) return console.error(err);
	  	console.log("assets success!");
	  	
	  	// Clean dev files
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/___tilemap.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-1.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-2.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-3.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-4.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-5.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-6.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-7.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-8.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-9.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-10.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-11.tmx');
	    fs.unlinkSync('./___native/www/assets/tilemaps/maps/tilemap-12.tmx');
	    fs.unlinkSync('./___native/www/assets/fonts/xml2json.js');

	    console.log("dev assets cleaned!");
	});

	fs.copy('./lib', './___native/www/lib', function (err) {
	  	if (err) return console.error(err);
	  	console.log("libs success!");
	});

	fs.copy('./index-package.html', './___native/www/index.html', function (err) {
	  	if (err) return console.error(err);
	  	console.log("index success!");
	});
});