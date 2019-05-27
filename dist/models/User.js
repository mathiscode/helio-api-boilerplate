"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Schema = _mongoose["default"].Schema({
  id: {
    type: String,
    index: true,
    unique: true
  },
  username: {
    type: String,
    index: true,
    unique: true
  },
  email: {
    type: String,
    index: true,
    unique: true
  },
  password: String,
  roles: [{
    type: String
  }],
  flags: {
    confirmed: {
      type: Boolean,
      "default": false
    }
  },
  profile: {
    name: String
  },
  settings: {},
  clientSettings: {},
  serverSettings: {}
}, {
  timestamps: true
});

Schema.methods.validPassword = function (password) {
  return _bcryptjs["default"].compareSync(password, this.password);
};

var _default = _mongoose["default"].model('User', Schema);

exports["default"] = _default;