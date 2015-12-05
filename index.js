var RenderServer = require('./lib/Server');
var config = require('./server.config');

var server = RenderServer(config);

module.exports = server;