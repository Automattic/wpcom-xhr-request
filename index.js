
/**
 * Module dependencies.
 */

var superagent = require('superagent');
var debug = require('debug')('wpcom-xhr-request');

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
  debug('API HTTP Method:', method);
  delete params.method;

  var url = apiUrl + params.path;
  debug('API URL:', url);
  delete params.path;

  // create HTTP Request object
  var req = superagent[method](url);

  if (params.authToken) {
    req.set('Authorization', 'Bearer ' + params.authToken);
    delete params.authToken;
  }

  debug('API params:', params);
  req.send(params);

  // start the request
  req.end(function (err, res){
    if (err) return fn(err);
    var body = res.body;
    var statusCode = res.status;
    debug('%s -> %s status code', url, statusCode);

    if (2 === Math.floor(statusCode / 100)) {
      // 2xx status code, success
      fn(null, body);
    } else {
      // any other status code is a failure
      err = new Error();
      err.statusCode = statusCode;
      for (var i in body) err[i] = body[i];
      if (body.error) err.name = toTitle(body.error) + 'Error';
      fn(err);
    }
  });
}

function toTitle (str) {
  if (!str || 'string' !== typeof str) return '';
  return str.replace(/((^|_)[a-z])/g, function ($1) {
    return $1.toUpperCase().replace('_', '');
  });
}
