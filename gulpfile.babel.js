import gulp from 'gulp';
import browserSync from 'browser-sync';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import source  from 'vinyl-source-stream';
import plugins  from 'gulp-load-plugins';
browserSync.create();

// See: https://gist.github.com/marceloogeda/5a449caa50462ab2667540a93d34009f

// Static Server + watching scss/html files
export const webserver = () => {
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

  gulp.watch('./public/static/css/*.css').on('change', gulp.series(styles));
  gulp.watch('./public/static/js/*.js').on('change', gulp.series(script));
  gulp.watch("./public/*.html").on('change', browserSync.reload);
}

const script = () => {
  
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
          // .pipe(buffer())
          // .pipe(plugins().sourcemaps.init({'loadMaps': true}))
          // .pipe(plugins().sourcemaps.write('.'))
          // Start piping stream to tasks!
          .pipe(gulp.dest('public/apid/js/'))
          .pipe(browserSync.reload({stream: true}));
}

function styles() {
  return gulp.src('./public/static/css/*.css')
          // .pipe(plugins().sourcemaps.init())
          // // .pipe(plugins().sass().on('error', plugins().sass.logError))
          // .pipe(plugins().sourcemaps.write())
          .pipe(gulp.dest('public/apid/css/'))
          .pipe(browserSync.reload({stream: true}));
}

function img() {
  return gulp.src('./public/static/img/*')
          // .pipe(plugins().sourcemaps.init())
          // .pipe(plugins().sourcemaps.write())
          .pipe(gulp.dest('public/apid/img/'))
          .pipe(browserSync.reload({stream: true}));
}

export const serve = gulp.series(img, styles, script, webserver)
export const compile = gulp.series(img, styles, script)

// Default task
export default serve;