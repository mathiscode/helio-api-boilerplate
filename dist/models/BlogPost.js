"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Schema = _mongoose["default"].Schema({
  id: {
    type: String,
    index: true,
    unique: true
  }
}, {
  timestamps: true
});

var _default = _mongoose["default"].model('BlogPost', Schema);

exports["default"] = _default;