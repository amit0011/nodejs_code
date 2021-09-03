var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var jshint = require('gulp-jshint');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var environments = require('gulp-environments');
var spa = require("browser-sync-spa");
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var production = environments.production;
/** load config file based on enviroment */
var configFile = production() ? "./src/env/prod.js" : "./src/env/dev.js";

gulp.task('lint', function() {
    return gulp.src('./src/app/**/*.js')
        .pipe(jshint({
            "esversion": 9
        }))
        .pipe(jshint.reporter('default', {
            verbose: true,
            "esversion": 9
        }));
});

gulp.task('imagemin', function() {
    var imgSrc = 'src/assets/images/*.+(png|jpg|gif)',
        imgDst = './public/assets/images';

    return gulp.src(imgSrc)
        .pipe(changed(imgDst))
        .pipe(imagemin())
        .pipe(gulp.dest(imgDst));
});

gulp.task('scripts', function() {
    return gulp.src(['./src/assets/**/*.js', configFile])
        .pipe(uglify())
        //.pipe(rev())
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream({once: true}));
});

gulp.task('browserify', function() {
    // Grabs the app.js file
    return browserify('./src/app/app.js')
        // bundles it and creates a file called main.js
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./public'))
        .pipe(browserSync.stream({once: true}));
});

gulp.task('scss', function() {
    return gulp.src('./src/assets/scss/*.scss')
        //.pipe(rev())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./globals/assets/stylesheets/'));
});

gulp.task('copy', gulp.series(['browserify', 'scss'], function() {
    return gulp.src(['./src/**/*.html', './src/**/*.css', './globals/**/*.css'])
        //.pipe(rev())
        .pipe(gulp.dest('./public'))
        .pipe(browserSync.stream({once: true}));
}));

gulp.task('build', gulp.series(
    gulp.parallel('lint', 'imagemin'), 
    gulp.parallel('copy', 'scripts')
));

gulp.task('browser-sync', gulp.series(['build'], function() {
    browserSync.init({
        server: {
            baseDir: "./public",
            // The key is the url to match
            // The value is which folder to serve (relative to your current working directory)
            routes: {
                "/bower_components": "bower_components",
                "/node_modules": "node_modules"
            }
        },
        watchOptions: {
            awaitWriteFinish : true
        }
    });
    browserSync.use(spa({

        // Only needed for angular apps
        selector: "[myApp]",

        // Options to pass to connect-history-api-fallback.
        // If your application already provides fallback urls (such as an existing proxy server),
        // this value can be set to false to omit using the connect-history-api-fallback middleware entirely.
        history: {
            index: './public/index.html'
        }
    }));
}));

gulp.task('default', gulp.parallel('browser-sync', function() {
    gulp.watch("./src/**/*.js", gulp.series("lint", "scripts", 'browserify'));
    gulp.watch("./src/**/*.{html,css}", gulp.series("copy"));
    gulp.watch("./src/**/*.scss", gulp.series("scss", "copy"));
    // gulp.watch("./public/**/*.*").on('change', browserSync.reload);
}));