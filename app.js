// load dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('cookie-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./logger');
// async error handlers
require('express-async-errors');

// load app configuration
let appConfig = require('./config/app-config');

exports.startServer = function ({ port = appConfig.port } = {}) {
  // load passport configuration
  require('./config/passport')(passport);

  // setup application
  let app = express();

  app.use(require('helmet')());

  // static folder
  app.use(appConfig.mountPath, express.static(path.join(__dirname, '/public')));

  // view engine -> handlebars
  app.engine(
    '.hbs',
    exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      helpers: require('./lib/helpers/hbs.js'),
    })
  );
  app.set('view engine', '.hbs');

  // initialize logger
  if (process.env.NODE_ENV === 'production') {
    app.use(
      require('morgan')('combined', {
        stream: logger.stream,
        skip: (req, res) => {
          return req.originalUrl.substr(-5) === '/ping';
        },
      })
    );
  } else {
    app.use(require('morgan')('dev'));
  }

  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(cookieParser());

  // sessions
  const sess = {
    name: '_exh_portal',
    keys: ['qjbaiMmFW8', 'JpVaIaa6TP'],
  };

  if (process.env.NODE_ENV === 'production') {
    // If you are using a hosting provider which uses a proxy (eg. Heroku),
    // comment in the following app.set configuration command
    //
    // Trust first proxy, to prevent "Unable to verify authorization request state."
    // errors with passport-auth0.
    // Ref: https://github.com/auth0/passport-auth0/issues/70#issuecomment-480771614
    // Ref: https://www.npmjs.com/package/express-session#cookiesecure
    app.set('trust proxy', 1);

    sess.secure = true; // serve secure cookies, requires https
  }

  app.use(session(sess));

  // passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());

  // Handle auth failure error messages
  app.use(function (req, res, next) {
    if (req && req.query && req.query.error) {
      req.flash('error', req.query.error);
    }
    if (req && req.query && req.query.error_description) {
      req.flash('error_description', req.query.error_description);
    }
    next();
  });

  app.use(
    require('./middleware/baseUrl')(), // make baseUrl accessible in views
    require('./middleware/slash')() // add trailing slash for consistency on get / head request
  );

  // setup routes
  app.use(appConfig.mountPath, require('./routes/index'));

  // Catch 404 and forward to error handler
  app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    err.path = req.originalUrl;
    next(err);
  });

  // generic error handler
  // Will not print stacktrace on prod
  app.use(function (err, req, res, next) {
    console.error(err);
    logger.error(err);
    res.status(err.status || 500);
    res.render('error', {
      layout: 'main',
      status: err.status || 500,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '' : err.stack,
    });
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      logger.info(`Listening on port ${server.address().port}`);
      // this block of code turns `server.close` into a promise API
      const originalClose = server.close.bind(server);
      server.close = () => {
        return new Promise((resolveClose) => {
          originalClose(resolveClose);
        });
      };
      // this ensures that we properly close the server when the program exists
      setupCloseOnExit(server);
      // resolve the whole promise with the express server
      resolve(server);
    });
  });
};

// ensures we close the server in the event of an error.
function setupCloseOnExit(server) {
  // thank you stack overflow
  // https://stackoverflow.com/a/14032965/971592
  async function exitHandler(options = {}) {
    await server
      .close()
      .then(() => {
        logger.info('Server successfully closed');
      })
      .catch((e) => {
        logger.warn('Something went wrong closing the server', e.stack);
      });
    if (options.exit) process.exit();
  }
  // do something when app is closing
  process.on('exit', exitHandler);
  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true }));
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
}
