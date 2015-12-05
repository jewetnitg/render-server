/**
 * @author rik
 */
// original source http://thedigitalself.com/blog/seo-and-javascript-with-phantomjs-server-side-rendering
var http = require("http"),
  url = require("url"),
  path = require("path"),
  fs = require("fs"),
  spawn = require('child_process').spawn;

var mimeTypes = {
  "htm": "text/html",
  "html": "text/html",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png",
  "gif": "image/gif",
  "js": "text/javascript",
  "css": "text/css"
};

function RenderServer(options) {
  var props = {
    port: {
      value: options.port || 9001
    },
    relativePath: {
      value: options.relativePath
    }
  };
  return Object.create(RenderServer.prototype, props);
}
// @todo run anyway, for pushState
// @todo find some way to navigate to the correct pushState, maybe we can execute app.navigate ?
RenderServer.prototype = {

  start: function () {
    var self = this;
    http.createServer(function (request, response) {
      var uri = url.parse(request.url).pathname;
      var filename = path.join(process.cwd(), uri);

      tryToFindFile(path.join(relativePath, filename), function (contents) {
        var responseBody = ""; // @todo set to index by default

        if (contents !== false) {
          responseBody = contents;
        }

        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];

        response.writeHead(200, {"Content-Type": mimeType});

        if (mimeType === mimeTypes.html) {
          render(filename, response, mimeType, uri);
        } else {
          response.write(responseBody, "binary");
          response.end();
        }
      });
    }).listen(parseInt(self.port, 10));
  }

};

function tryToFindFile(filename, callback) {
  path.exists(filename, function (exists) {
    if (!exists) {
      callback(false);
    } else {
      fs.stat(filename, function (err, stats) {
        if (err || stats.isDirectory()) {
          return callback(false);
        }

        fs.readFile(filename, "binary", function (err, file) {
          if (err) {
            return callback(false);
          }

          callback(file);
        });
      });
    }
  });
}

function render(filename, response, mimeType, uri) {
  // @todo handle uri so it is picked up by pushState
  console.log(uri);
  phantom = spawn('phantomjs', ['render.js', filename]);

  phantom.stdout.on('data', function (data) {
    response.write(data, "utf8");
    response.end();
    console.log('200: ' + filename + ' as ' + mimeType);
  });

  phantom.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  phantom.on('exit', function (code) {
    console.log('child process exited with code ' + code);
  });
}

module.exports = RenderServer;