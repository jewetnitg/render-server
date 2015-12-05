/**
 * @author rik
 */
// original source http://thedigitalself.com/blog/seo-and-javascript-with-phantomjs-server-side-rendering
var http = require("http"),
  url = require("url"),
  path = require("path"),
  fs = require("fs"),
  request = require('request'),
  serverConfig = require("../server.config"),
  spawn = require('child_process').spawn;

// @todo implement caching, maybe we can used LazyLoader ?
function RenderServer(options) {
  var props = {
    port: {
      value: options.port || 9001
    }
  };
  return Object.create(RenderServer.prototype, props);
}

RenderServer.prototype = {

  start: function () {
    http.createServer(function (request, response) {
      var uri = url.parse(request.url).pathname;
      var ext = uri.split('.');
      ext = ext && ext[ext.length - 1];

      if (ext && serverConfig.extensions.indexOf(ext) !== -1) {
        respondWithAsset(response, uri);
      } else {
        render(response, uri);
      }
    }).listen(parseInt(this.port, 10));
  }

};

function respondWithAsset(response, uri) {
  request(serverConfig.serverUrl + uri, function (err, res, body) {
    respond(response, body);
  });
}

function render(response, uri) {
  phantom = spawn('phantomjs', ['lib/render.js', uri]);

  phantom.stdout.on('data', function (data) {
    respond(response, data, false);
  });

  phantom.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  phantom.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    response.end();
  });
}

function respond(response, data, end) {
  end = typeof end === 'undefined' ? true : end;

  response.writeHead(200);
  response.write(data, "utf8");

  if (end) {
    response.end();
  }
}

module.exports = RenderServer;