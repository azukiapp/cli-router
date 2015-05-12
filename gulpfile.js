require('source-map-support').install();

var azk_gulp = require('azk-dev/gulp')({
  cwd  : __dirname,
  babel: {},
});

var gulp = azk_gulp.gulp;
