const gulp = require('gulp');
const browserSync = require('browser-sync').create();


function serve() {
  browserSync.init({
      watch: true,
      open: true,
      server: "./public",
      ui: { port: 8081 },
      port: 8080
  });

  gulp.watch("./public/*.html").on('change', browserSync.reload);
}

// Static Server + watching scss/html files
exports.serve = serve;