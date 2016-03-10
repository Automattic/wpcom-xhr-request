# wpcom-xhr-request

**REST API requests to WordPress.com via XMLHttpRequest (and CORS)**

You likely want to use the high-level APIs in [`wpcom.js`][wpcom.js]
instead of using this module directly.

Works in both the browser and Node.js via [`superagent`][superagent].


### Installation

Install `wpcom-xhr-request` using `npm`:

``` bash
$ npm install wpcom-xhr-request
```


### Example

``` html
<html>
  <body>
    <script src="wpcom-xhr-request.js"></script>
    <script>
      WPCOM.xhr('/me', function(err, data) {
        if (err) throw err;

        var div = document.createElement('div');
        div.innerHTML = 'Your WordPress.com "username" is: <b>@' + data.username + '<\/b>';
        document.body.appendChild(div);
      });
    </script>
  </body>
</html>
```


### Authentication

For API requests that require authentication to WordPress.com, you must pass in an
OAuth token as the `authToken` parameter in the `params` object for the API call.

You can get an OAuth token server-side through
[`node-wpcom-oauth`][node-wpcom-oauth], or any other OAuth2 interaction
mechanism.


### License

MIT – Copyright Automattic 2014


[wpcom.js]: https://github.com/Automattic/wpcom.js
[superagent]: https://visionmedia.github.io/superagent/
[node-wpcom-oauth]: https://github.com/Automattic/node-wpcom-oauth
