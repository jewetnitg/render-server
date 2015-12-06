module.exports = function (gulp) {
  gulp.task('start', function () {
    var server = require('../index');
    console.log('server started');
  });
};
