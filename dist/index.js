"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _package = _interopRequireDefault(require("../package.json"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _expressJwt = _interopRequireDefault(require("express-jwt"));

var _winston = _interopRequireDefault(require("winston"));

var _winstonMongodb = require("winston-mongodb");

var _exampleMod = _interopRequireDefault(require("./mods/example-mod"));

var _helioModJokes = _interopRequireDefault(require("helio-mod-jokes"));

var _user = _interopRequireDefault(require("./routes/user"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

_dotenv["default"].config();

var PublicPaths = ['/', '/user/auth', '/user/register'].concat(_toConsumableArray(process.env.PUBLIC_PATHS ? process.env.PUBLIC_PATHS.split(',') : [])); // Set mods to load

var Mods = [{
  path: '/example',
  module: _exampleMod["default"]
}, {
  path: '/jokes',
  module: _helioModJokes["default"]
}]; // Core routes

var routes = [{
  path: '/user',
  module: _user["default"]
}];
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
require('winston-mongodb').MongoDB; // eslint-disable-line

LogTransports.push(new _winstonMongodb.MongoDB({
  db: process.env.DB_URI,
  silent: process.env.NODE_ENV === 'testing' || process.env.LOG_TO_DB === 'false'
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
  app.use(_bodyParser["default"].json()); // Provide logger to routes

  app.use(function (req, res, next) {
    req.Log = Log;
    next();
  }); // Setup mods public paths

  Mods.forEach(function (options) {
    var Mod = options.module;
    var instance = new Mod(options);
    var modPublicPaths = instance.publicPaths || [];
    PublicPaths = [].concat(_toConsumableArray(PublicPaths), _toConsumableArray(modPublicPaths));
    instance = null;
  }); // Setup JWT authentication

  app.use((0, _expressJwt["default"])({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false
  })); // decode token even on public paths

  app.use((0, _expressJwt["default"])({
    secret: process.env.JWT_SECRET
  }).unless({
    path: PublicPaths
  })); // protect private paths
  // Setup mod routes

  Mods.forEach(function (options) {
    var Mod = options.module;
    var instance = new Mod(options);
    app.use(options.path, instance.router);
  }); // Root handler

  app.get('/', function (req, res) {
    res.json({
      name: process.env.NAME || 'Helio API Server',
      version: process.env.SHOW_VERSION ? _package["default"].version : null
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
    if (process.env.CONSOLE_ERRORS === 'true') Log.error('APP ERROR:', err.stack);
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