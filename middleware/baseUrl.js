/**
 * Add base url to be available in views
 */

const appConfig = require('../config/app-config');

module.exports = function () {
  return function (req, res, next) {
    res.locals.baseUrl = appConfig.mountPath;
    next();
  };
};
