const browserify        = require('browserify');
const gulp              = require('gulp');
const source            = require('vinyl-source-stream');
const glob              = require('glob');
const es                = require('event-stream');
const responsive        = require('gulp-responsive');
const jeditor           = require("gulp-json-editor");
const packager          = require('electron-packager');
const pkg               = require('./package.json');

gulp.task('bump', function(done){

})

gulp.task('extension:js', function(done) {
    glob('./extension/lib/**/index.js', function(err, files) {
        if(err) done(err);

        var tasks = files.map(function(entry) {
            return browserify({ entries: [entry] })
                .bundle()
                .pipe(source(entry))
                .pipe(gulp.dest('./build'));
            });
        es.merge(tasks).on('end', done);
    });
});

gulp.task('extension:icon', function () {
  return gulp.src('icon.png')
    .pipe(responsive({
        '*': [{
            width: 16,
            rename: {
                suffix: "_16"
            }
        },{
            width: 48,
            rename: {
                suffix: "_48"
            }
        },{
            width: 128,
            rename: {
                suffix: "_128"
            }
        }]
    }))
    .pipe(gulp.dest('build/extension'));
});

gulp.task('extension:manifest', function () {
    gulp.src("extension/manifest.json")
        .pipe(jeditor({
            icons: {
                16: "icon_16.png",
                48: "icon_48.png",
                128: "icon_128.png"
            }
        }))
        .pipe(gulp.dest("build/extension/"));
});

gulp.task('build:osx', (callback) => {
    var opts = {
        platform: 'darwin',
        arch: 'all',
        asar: false,
        cache: './cache',
        dir: './',
        ignore: './build, ./extension',
        icon: './icon.icns',
        name: pkg.name,
        out: './build/app',
        overwrite: true,
        // version: pkg.electronVersion,
        // 'app-version': pkg.version
    };

    console.log('Building osx');
    packager(opts, (err, appPath) => {});
});
