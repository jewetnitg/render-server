var server = require('../index');

module.exports = function (gulp) {
  gulp.task('start', function () {
    server.start();
    console.log('server started');
  });
};
