
/**
 * Module dependencies.
 */

var WPError = require('wp-error');
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
 * Default WordPress.com REST API Version.
 */

var defaultApiVersion = '1';

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
  debug('API HTTP Method: %o', method);
  delete params.method;

  var apiVersion = params.apiVersion || defaultApiVersion;
  delete params.apiVersion;

  var apiNamespace = params.apiNamespace;
  delete params.apiNamespace;

  proxyOrigin = params.proxyOrigin || proxyOrigin;
  delete params.proxyOrigin;

  var basePath = '/rest/v' + apiVersion;

  // If this is a WP-API request, adjust basePath
  if ( apiNamespace && /\//.test( apiNamespace ) ) {
    // New-style WP-API URL: /wpcom/v2/sites/%s/post-counts
    basePath = '/' + apiNamespace;
  } else if ( apiNamespace ) {
    // Old-style WP-API URL (deprecated): /wp-json/sites/%s/wpcom/v2/post-counts
    basePath = '/wp-json';
  }

  var url = proxyOrigin + basePath + params.path;
  debug('API URL: %o', url);
  delete params.path;

  // create HTTP Request object
  var req = superagent[method](url);

  // Token authentication
  if (params.authToken) {
    req.set('Authorization', 'Bearer ' + params.authToken);
    delete params.authToken;
  }

  // URL querystring values
  if (params.query) {
    req.query(params.query);
    debug('API send URL querystring: %o', params.query);
    delete params.query;
  }

  // POST API request body
  if (params.body) {
    req.send(params.body);
    debug('API send POST body: %o', params.body);
    delete params.body;
  }

  // POST FormData (for `multipart/form-data`, usually a file upload)
  if (params.formData) {
    for (var i = 0; i < params.formData.length; i++) {
      var data = params.formData[i];
      var key = data[0];
      var value = data[1];
      debug('adding FormData field %o', key);
      req.field(key, value);
    }
  }

  // start the request
  req.end(function (err, res){
    if (err && !res) {
      return fn(err);
    }

    var body = res.body;
    var headers = res.headers;
    var statusCode = res.status;
    debug('%o -> %o status code', url, statusCode);

    if (body && headers) {
      body._headers = headers;
    }

    if (res.ok) {
      fn(null, body);
    } else {
      var wpe = WPError({
        path: res.req.path, method: res.req.method
      }, statusCode, body);

      fn(wpe);
    }
  });

  return req.xhr;
}
