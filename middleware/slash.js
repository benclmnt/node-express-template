/**
 * Add trailing slash for consistency on GET or HEAD request
 */

var parseURL = require('url').parse;

module.exports = function () {
  return function (req, res, next) {
    var method = req.method.toLowerCase();

    // Skip when the request is neither a GET or HEAD.
    if (!(method === 'get' || method === 'head')) {
      return next();
    }

    // skip if path has extension
    if (req.path.split('/').pop().includes('.')) {
      return next();
    }

    let url = parseURL(req.url),
      pathname = url.pathname,
      search = url.search || '',
      hasSlash = pathname.charAt(pathname.length - 1) === '/';

    if (!hasSlash) {
      // add slash
      pathname = pathname + '/';
      // redirect to truest url
      res.redirect(301, pathname + search);
    } else {
      return next();
    }
  };
};
