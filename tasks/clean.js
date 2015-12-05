var del = require('del');
var serverConfig = require('../server.config');

module.exports = function (gulp) {
  gulp.task('clean', function (cb) {
    return del(serverConfig.relativePath, cb);
  });
};
