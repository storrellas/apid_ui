const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const babelify = require('babelify');

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

// Static Server + watching scss/html files
exports.serve = serve;

// Default task
exports.default = serve;