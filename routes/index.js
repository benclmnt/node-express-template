const router = require('express').Router();
const { ensureAuth } = require('../middleware/secureRoutes');
const { getUserInfo } = require('../middleware/processUser');
const cache = require('../lib/cache');

// @desc  login
// @route GET /
router.get('/', (req, res) => {
  res.render('home', { layout: 'main' });
});

// ping
router.get('/ping', function (req, res) {
  res.send('OK');
});

// flush all cache
router.get('/flush', function (req, res) {
  cache.flush();
  res.send('OK');
});

module.exports = router;
