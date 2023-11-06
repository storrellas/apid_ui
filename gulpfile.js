// import gulp from 'gulp';
// import browserSync from 'browser-sync';
// import browserify from 'browserify';
const gulp = require('gulp');
const browserSync = require('browser-sync');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
browserSync.create();

// See: https://gist.github.com/marceloogeda/5a449caa50462ab2667540a93d34009f

function serve() {
  browserSync.init({
      watch: true,
      open: true,
      server: {
        baseDir: "./public",
        routes: {
            "/vendor": "./node_modules"
        }
      },
      ui: { port: 8081 },
      port: 8080
  });

  gulp.watch("./public/*.html").on('change', browserSync.reload);
}

function compile() {
  
  return browserify({
          'entries': ['./public/static/js/main.js'],
          'debug': true,
        })
        .transform("babelify", {
          presets: ["@babel/preset-env", "@babel/preset-react"]
        })
        // Bundle sources
        .bundle()
        // Pass desired output filename to vinyl-source-stream
        .pipe(source('bundle.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('public/build/'));

    
  // return browserify({
  //     'entries': ['./public/static/js/main.js'],
  //     'debug': true,
  //     'transform': [
  //         babelify.configure({
  //             'presets': ['es2015', 'react']
  //         })
  //     ]
  //   })
  //   .bundle()
  //   .on('error', function () {
  //       var args = Array.prototype.slice.call(arguments);

  //       plugins().notify.onError({
  //           'title': 'Compile Error',
  //           'message': '<%= error.message %>'
  //       }).apply(this, args);

  //       this.emit('end');
  //   })
  //   .pipe(source('bundle.js'))
  //   .pipe(buffer())
  //   .pipe(plugins().sourcemaps.init({'loadMaps': true}))
  //   .pipe(plugins().sourcemaps.write('.'))
  //   .pipe(gulp.dest('./build/js/'))
  //    .pipe(browserSync.stream());
}

// Static Server + watching scss/html files
exports.serve = serve;
// Static Server + watching scss/html files
exports.compile = compile;

// Default task
exports.default = serve;