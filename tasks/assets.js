var path = require('path');
var shell = require('./helpers/shell');
var gutil = require('gulp-util');
var serverConfig = require('../server.config');

// this task builds the static assets, it really builds a (git) submodule
module.exports = function (gulp) {
  var srcDir = './src';
  var srcDstDir = 'build/dst'; // the directory, relative to src, where the build will be put
  var gulpfileFileName = 'gulpfile.js'; // the filename of the gulpfile
  var targetDir = serverConfig.relativePath; // dir we want the build to be put in
  var gulpTask = 'build:prod'; // gulp task to run
  var tempDir = '.asset_server_tmp'; // make sure no dir with this name contains anything you need

  var gulpfilePath = path.join(srcDir, gulpfileFileName);
  var srdDstPath = path.join(srcDir, srcDstDir);

  // workaround for cp path/* not working for some reason
  var dstSuffix = srcDstDir.split(/\/|\\/g);
  var tmpDstPath = dstSuffix
    ? path.join(tempDir, dstSuffix[dstSuffix.length - 1])
    : tempDir;

  gulp.task('assets', function (done) {
    shell.series([
      'rm -rf ' + tempDir,
      'rm -rf ' + targetDir,
      'mkdir ' + tempDir,
      // pull the submodule
      'git -C ' + srcDir + ' checkout master',
      'git -C ' + srcDir + ' pull',
      // npm install the submodule
      'npm i --prefix ' + srcDir,
      // run the submodules build
      'gulp --gulpfile ' + gulpfilePath + ' ' + gulpTask,
      // copy the submodules build to the temp dir, this is a workaround for /* not working for some reason
      'cp -R ' + srdDstPath + ' ' + tempDir,
      'mv ' + tmpDstPath + ' ' + targetDir,
      'rm -rf ' + tempDir
    ], done);
  });

};
