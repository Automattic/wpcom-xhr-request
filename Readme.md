# wpcom-xhr-request

**REST API requests to WordPress.com via XMLHttpRequest (and CORS)**

You likely want to use the high-level APIs in [`wpcom.js`][]
instead of using this module directly.

Works in both the browser and Node.js via `superagent`.


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
      WPCOMXhrRequest('/me', function(err, res){
        if (err) throw err;

        var div = document.createElement('div');
        div.innerHTML = 'Your WordPress.com "username" is: <b>@' + res.username + '<\/b>';
        document.body.appendChild(div);
      });
    </script>
  </body>
</html>
```


### License

MIT – Copyright Automattic 2014


[wpcom.js]: https://github.com/Automattic/wpcom.js
