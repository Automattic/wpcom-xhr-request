
/**
 * Example usage of `wpcom-xhr-request` used in Node.js
 */

var request = require('./');

request('/freshly-pressed', function (err, articles) {
  if (err) throw err;
  console.log('Freshly Pressed Posts:');
  articles.posts.forEach(function (post) {
    console.log('  %s - %s', post.title, post.short_URL);
  });
});
