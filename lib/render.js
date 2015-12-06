/**
 * @author rik
 */
var system = require('system'),
  fs = require('fs'),
  page = new WebPage(),
  serverConfig = require('../server.config'),
  uri = system.args[1] || "";

page.open(serverConfig.serverUrl + uri, function (status) {
  if (status !== 'success') {
    console.log('FAILED to load the url', uri);
    phantom.exit();
  } else {

    page.onCallback = function (html) {
      console.log(html);
      phantom.exit();
    };

    page.evaluate(function (uri) {
      window._onAppReady = function () {
        window.app.router.navigate(uri);
      };

      window._onRouterReady = function () {
        setTimeout(function () {
          var html = document.querySelector('html').outerHTML
            .replace(/<\/body>/gi, '<script>window._preRendered = true;</script></body>');

          window.callPhantom(html);
        }, 0);
      };
    }, uri);
  }
});