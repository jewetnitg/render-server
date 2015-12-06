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

      function getHtml() {
        return document.querySelector('html').outerHTML
          .replace(/<\/body>/gi, '<script>window._preRendered = true;</script></body>');
      }

      function resolveHtml() {
        setTimeout(function () {
          window.callPhantom(getHtml());
        }, 0);
      }

      function navigate() {
        window._onRouterReady = function () {
          resolveHtml();
        };
        window.app.router.navigate(uri);
      }

      function listenForAppReady() {
        window._onAppReady = function () {
          navigate();
        };
      }

      if (!window.app.ready) {
        listenForAppReady();
      } else {
        navigate();
      }

    }, uri);
  }
});