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
// @todo tunnel session / cookies
// @todo use database to store cache, try to do it in combination with session
var cache = {};

function RenderServer() {
  const server = Object.create(RenderServer.prototype);

  server.start();

  return server;
}

RenderServer.prototype = {

  start: function () {
    http.createServer(function (request, response) {
      var uri = url.parse(request.url).pathname;

      if (cache[request.url]) {
        respond(response, cache[uri]);
      } else {
        var ext = uri.split('.');
        ext = ext && ext[ext.length - 1];

        if (ext && serverConfig.extensions.indexOf(ext) !== -1) {
          respondWithAsset(response, uri);
        } else {
          render(response, uri);
        }
      }
    }).listen(parseInt(serverConfig.port, 10));
  }

};

function respondWithAsset(response, uri) {
  request(serverConfig.serverUrl + uri, function (err, res, body) {
    setCache(uri, body);
    respond(response, body);
  });
}

function setCache(uri, data) {
  cache[uri] = data;

  setTimeout(function () {
    delete cache[uri];
  }, serverConfig.cacheLifeTime);
}

function render(response, uri) {
  phantom = spawn('phantomjs', ['lib/render.js', uri]);

  phantom.stdout.on('data', function (data) {
    setCache(uri, data);
    respond(response, data, false);
  });

  phantom.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  phantom.on('exit', function (code) {
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