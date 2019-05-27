"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Schema = _mongoose["default"].Schema({
  token: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

Schema.index({
  createdAt: 1
}, {
  expires: process.env.JWT_TIMEOUT || '1h'
});

var _default = _mongoose["default"].model('TokenWhitelist', Schema);

exports["default"] = _default;