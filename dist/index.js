"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("@babel/polyfill");

var _package = _interopRequireDefault(require("../package.json"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _expressJwt = _interopRequireDefault(require("express-jwt"));

var _winston = _interopRequireDefault(require("winston"));

var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));

var _winstonMongodb = require("winston-mongodb");

var _config = require("./config");

var _TokenWhitelist = _interopRequireDefault(require("./models/TokenWhitelist"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var PublicPaths = ['/'].concat(_toConsumableArray(process.env.PUBLIC_PATHS ? process.env.PUBLIC_PATHS.split(',') : [])); // Set Core routes to load
// You should be using a mod instead, but this is here in case you need it
// format: { path: '/path', module: <Express Router or Middleware Function> }

var routes = [];
var app = (0, _express["default"])(); // Setup and connect to database; server will not run until connected

_mongoose["default"].set('useNewUrlParser', true);

_mongoose["default"].set('useFindAndModify', false);

_mongoose["default"].set('useCreateIndex', true);

var initError = false;
if (!process.env.DB_URI) initError = 'You must define a mongodb DB_URI environment variable';
if (!process.env.JWT_SECRET) initError = 'You must define a JWT_SECRET environment variable';

if (!process.env.JWT_SECRET) {
  console.error(initError);
  process.exit(1);
} // Setup logger


var LogTransports = [];
if (process.env.NODE_ENV !== 'testing' && process.env.LOG_TO_DB !== 'false') LogTransports.push(new _winstonMongodb.MongoDB({
  db: process.env.DB_URI
}));
LogTransports.push(new _winston["default"].transports.Console({
  format: _winston["default"].format.simple(),
  silent: process.env.NODE_ENV === 'testing' || process.env.CONSOLE_LOG === 'false'
}));

var Log = _winston["default"].createLogger({
  format: _winston["default"].format.json(),
  transports: LogTransports
});

Log.info('Connecting to database...');

_mongoose["default"].connect(process.env.DB_URI, function (err) {
  if (err) {
    Log.error(err.toString());
    process.exit(2);
  } else {
    initializeServer();
  }
});

var initializeServer = app.initializeServer = function () {
  app.disable('x-powered-by');
  app.use(_bodyParser["default"].json()); // Uncomment the next line if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // app.set('trust proxy', 1)
  // Setup rate limiting

  var limiter = (0, _expressRateLimit["default"])({
    windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS_PER_WINDOW || 100,
    skip: function skip(req, res) {
      return req.ip === '127.0.0.1' || req.ip === '::1';
    }
  });
  app.use(limiter); // Provide logger to routes

  app.use(function (req, res, next) {
    req.Log = Log;
    next();
  }); // Setup mods public paths

  _config.Mods.forEach(function (options) {
    var Mod = options.module;
    var instance = new Mod(options);
    var modPublicPaths = instance.publicPaths || [];
    PublicPaths = [].concat(_toConsumableArray(PublicPaths), _toConsumableArray(modPublicPaths));
    instance = null;
  }); // Setup JWT authentication


  var checkTokenRevocation =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(req, payload, done) {
      var inWhitelist;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _TokenWhitelist["default"].countDocuments({
                token: req.headers.authorization.replace('Bearer ', '')
              });

            case 2:
              inWhitelist = _context.sent;
              return _context.abrupt("return", done(null, !inWhitelist));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function checkTokenRevocation(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();

  app.use((0, _expressJwt["default"])({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false
  })); // decode token even on public paths

  app.use((0, _expressJwt["default"])({
    secret: process.env.JWT_SECRET,
    isRevoked: checkTokenRevocation
  }).unless({
    path: PublicPaths
  })); // protect private paths
  // Setup mod routes

  _config.Mods.forEach(function (options) {
    var Mod = options.module;
    var instance = new Mod(options);

    if (instance.receiveModels && instance.needModels) {
      var giveModels = _config.ModModels.filter(function (model) {
        return instance.needModels.includes(model.name);
      });

      instance.receiveModels(giveModels);
    }

    app.use(options.path, instance.router);
    Log.info("[MOD REGISTERED] ".concat(instance.name));
  }); // Root handler


  app.get('/', function (req, res) {
    res.json({
      name: process.env.NAME || 'Helio API Server',
      version: process.env.SHOW_VERSION === 'true' ? _package["default"].version : null
    });
  }); // Setup core routes

  routes.forEach(function (route) {
    app.use(route.path, route.module);
  }); // Catch 404

  app.use(function (req, res, next) {
    res.status(404).json({
      error: 'Invalid API method'
    });
  }); // Catch other errors

  app.use(function (err, req, res, next) {
    if (process.env.CONSOLE_ERRORS === 'true' && err.name !== 'UnauthorizedError') Log.error('APP ERROR:', err.stack);
    if (err.name === 'UnauthorizedError') return res.status(401).json({
      error: 'Invalid token'
    });
    return res.status(500).json({
      error: 'Internal API error'
    });
  }); // Start listening for requests

  app.listen(process.env.PORT || 3001);
  Log.info("".concat(process.env.NAME || 'Helio API Server', " listening"));
};

var _default = app;
exports["default"] = _default;