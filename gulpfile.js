var azk_gulp = require('azk-dev/gulp')({
  cwd  : __dirname,
  lint: [ "bin/**/*.js" ], // Extra files for the lint analyzer
});

var gulp = azk_gulp.gulp;

gulp.task('__sample__', 'This is a sample task', function() {
  console.log('\nHello Azuki!\n');
});
