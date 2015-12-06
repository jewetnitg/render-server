/**
 * @author rik
 */
module.exports = {
  port: 9001,
  serverUrl: 'http://localhost:9000', // should not have a trailing slash
  extensions: ['gif', 'png', 'jpg', 'js', 'css', 'tag'],
  cacheLifeTime: 5 * 60 * 1000 // 5 minutes
};