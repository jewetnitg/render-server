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
    // @todo listen for app ready event
    setTimeout(function () {
      page.evaluate(function (uri) {
        window.app.router.navigate(uri);
      }, uri);

    }, 1000);

    // @todo listen for route event, if possible (might be impossible because of phantom js)
    setTimeout(function () {
      var html = page.evaluate(function () {
        window._preRendered = true;
        return document.querySelector('html').outerHTML;
      });

      console.log(html);

      phantom.exit();
    }, 500);
  }
});