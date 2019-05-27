"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModModels = exports.Mods = void 0;

var _exampleMod = _interopRequireDefault(require("./mods/example-mod"));

var _blogMod = _interopRequireDefault(require("./mods/blog-mod"));

var _helioModUsers = _interopRequireDefault(require("helio-mod-users"));

var _helioModJokes = _interopRequireDefault(require("helio-mod-jokes"));

var _User = _interopRequireDefault(require("./models/User"));

var _BlogPost = _interopRequireDefault(require("./models/BlogPost"));

var _TokenWhitelist = _interopRequireDefault(require("./models/TokenWhitelist"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Import mods
// Import models
var Mods = [{
  path: '/example',
  module: _exampleMod["default"]
}, {
  path: '/user',
  module: _helioModUsers["default"]
}, {
  path: '/blog',
  module: _blogMod["default"]
}, {
  path: '/jokes',
  module: _helioModJokes["default"]
}]; // Set models to be provided to mods

exports.Mods = Mods;
var ModModels = [{
  name: 'User',
  model: _User["default"]
}, {
  name: 'BlogPost',
  model: _BlogPost["default"]
}, {
  name: 'TokenWhitelist',
  model: _TokenWhitelist["default"]
}];
exports.ModModels = ModModels;