
/**
 * Module dependencies.
 */

var superagent = require('superagent');
var debug = require('debug')('wpcom:xml');

/**
 * Export a single `request` function.
 */

module.exports = request;

/**
 * WordPress.com REST API base endpoint.
 */

var proxyOrigin = 'https://public-api.wordpress.com';

/**
 * WordPress.com v1 REST API URL.
 */

var apiUrl = proxyOrigin + '/rest/v1';

/**
 * Performs an XMLHttpRequest against the WordPress.com REST API.
 *
 * @param {Object|String} params
 * @param {Function} fn
 * @api public
 */

function request (params, fn) {

  if ('string' == typeof params) {
    params = { path: params };
  }

  var method = (params.method || 'GET').toLowerCase();
  console.log('API HTTP Method:', method);
  delete params.method;

  var url = apiUrl + params.path;
  console.log('API URL:', url);
  delete params.path;

  var req = superagent[method](url);

  if (params.authToken) {
    req.set('Authorization', 'Bearer ' + params.authToken);
    delete params.authToken;
  }

  //req.query({ http_envelope: 1 });
  console.log('API params:', params);
  req.send(params);

  // start the request
  req.end(function (err, res){
    if (err) return fn(err);
    console.log(res);

    // check wpcom server error response
    if (res.body.error) {
      return fn(new Error(res.body.message));
    }

    // TODO: take a look to this one please
    if ((/SyntaxError/).test(String(res.body))) {
      return fn(res.body);
    }

    debug('request successful');
    fn(null, res.body);
  });

  return req;
}
