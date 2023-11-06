import gulp from 'gulp';
import browserSync from 'browser-sync';
import browserify from 'browserify';
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
    .transform("babelify", {presets: ["@babel/preset-env", "@babel/preset-react"]})
    .bundle().pipe(process.stdout);
  // return new Promise(function(resolve, reject) {
  //   console.log("HTTP Server Started");
  //   resolve();
  // });
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