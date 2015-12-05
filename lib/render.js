/**
 * @author rik
 */
var system = require('system'),
  fs = require('fs'),
  page = new WebPage(),
  url = system.args[1],
  serverUrl = 'http://localhost:9000',
  uri = system.args[2];

page.open(serverUrl + uri, function (status) {
  if (status !== 'success') {
    console.log('FAILED to load the url', uri);
    phantom.exit();
  } else {
    setTimeout(function () {
      page.evaluateAsync(function () {
        window.app.router.navigate(uri);
      });

    }, 1000);

    setTimeout(function () {
      page.evaluateAsync(function () {
        console.log(document.querySelector('html').outerHTML);
        phantom.exit();
      });

    }, 1000);
  }
});