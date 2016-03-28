0.5.0 / 2016-03-28
==================

* adds support for new WP-API URL structure; deprecates old URL structure

0.4.1 / 2016-03-16
==================

  * [[`8fd9102cc6`](https://github.com/Automattic/wpcom-xhr-request/commit/8fd9102cc6)] - use the `req.method` for the WPError method (Nathan Rajlich)

0.4.0 / 2016-03-09
==================

  * dist: recompile
  * Readme++
  * Use `wp-error` for common Erorr handling logic

0.3.4 / 2016-2-18
==================

* adds support for special `apiNamespace` param to integrate core WP-API

0.3.3 / 2015-11-22
==================

  * add LICENSE file and add "license" to package.json
  * package: update "debug" to v2.2.0

0.3.2 / 2015-07-08
==================

  * set proxy origin through of parameters
  * Improve REST-API error response
  * bump "superagent" to "1.2.0"

0.3.1 / 2015-03-31
==================

  * package: update "superagent" to v1.1.0

0.3.0 / 2014-10-18
==================

  * package: update "debug" to v2.1.0
  * package: update "browserify" to v6.1.0
  * package: update "superagent" to v0.20.0
  * examples: add browser "upload" example
  * index: return the native XHR request instance
  * dist: recompile

0.2.6 / 2014-10-02
==================

  * dist: recompile
  * package: update "superagent" to v0.19.1
  * package: update "browserify" to v5.12.1
  * package: update "debug" to v2.0.0

0.2.5 / 2014-07-15
==================

  * package: update "superagent" to v0.18.2
  * package: update "browserify" to v4.2.0
  * index: use `%o` formatter for all debug() calls

0.2.4 / 2014-07-08
==================

  * index: handle the scenario when `res.body` is undefined

0.2.3 / 2014-06-24
==================

  * dist: recompile
  * package: update "browserify" to v4.1.11
  * index: added support for non v1 API endpoints via `apiVersion` option

0.2.2 / 2014-06-10
==================

  * dist: recompile
  * examples: decode HTML entities in "Freshly Pressed" example
  * package: be loose with the `debug` version

0.2.1 / 2014-06-05
==================

  * dist: recompile
  * package: update "debug" to v1.0.0
  * examples: fix browser `/freshly-pressed` example
  * examples: change `articles` variable name to `data`
  * index: set `_headers` on responses

0.2.0 / 2014-04-30
==================

  * pkg: bump superagent@0.18.0
  * index: check for `params.formData` object

0.1.0 / 2014-04-22
==================

  * initial release
