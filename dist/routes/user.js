"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _uuid = require("uuid");

var _User = _interopRequireDefault(require("../models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

var errorHandler = function errorHandler(err, res) {
  var code = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;
  console.error(err);
  if (res) return res.status(code).json({
    error: err.toString()
  });
};

router.get('/', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).select('-__v -_id -password').then(function (user) {
    res.json(user);
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.post('/auth', function (req, res) {
  var _req$body = req.body,
      email = _req$body.email,
      password = _req$body.password;

  _User["default"].findOne({
    email: email
  }).then(function (user) {
    var err = null;
    if (!user || !user.validPassword(password)) err = true;
    if (err) return res.status(403).json({
      error: 'Invalid email address or password'
    });

    _jsonwebtoken["default"].sign({
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles
    }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TIMEOUT || '1h'
    }, function (err, token) {
      if (err) return res.status(400).json({
        error: 'An error occurred authenticating your account'
      });
      res.set('X-AuthToken', token).json({
        token: token
      });
    });
  });
});
router.post('/register', function (req, res) {
  var _req$body2 = req.body,
      email = _req$body2.email,
      password = _req$body2.password; // TODO: Validate, implement bot protection, etc

  _bcryptjs["default"].hash(password, 10, function (err, hash) {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: 'Error hashing your password'
      });
    }

    _User["default"].findOne({
      email: email
    }).then(function (user) {
      if (user) return res.status(403).json({
        error: 'That email address is already linked to an account'
      });
      user = new _User["default"]({
        id: (0, _uuid.v4)(),
        email: email,
        username: email,
        password: hash,
        roles: ['user']
      });
      user.save(function (err, user) {
        if (err) return res.status(500).json({
          error: 'Error creating your account'
        });

        _jsonwebtoken["default"].sign({
          id: user._id,
          email: user.email,
          username: user.username,
          roles: user.roles
        }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_TIMEOUT || '1h'
        }, function (err, token) {
          if (err) return res.status(400).json({
            error: 'An error occurred authenticating your account'
          });
          res.set('X-AuthToken', token).json({
            token: token
          });
        });
      });
    });
  });
});
router.get('/client-settings', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).select('clientSettings').then(function (user) {
    res.json({
      clientSettings: user.clientSettings
    });
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.post('/client-settings', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).select('clientSettings').then(function (user) {
    // Block unreasonable client setting size
    if (Object.prototype.toString.call(req.body) !== '[object Object]') return res.status(400).json({
      error: 'Client Settings must be an object'
    });
    if (Object.keys(req.body).length > 1024) return res.status(400).json({
      error: 'Client Settings are too large'
    });
    user.clientSettings = req.body;
    user.save(function (err) {
      if (err) return errorHandler(err, res);
      res.json({
        message: 'Client Settings updated'
      });
    });
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.get('/settings', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).then(function (user) {
    res.json({
      settings: user.settings
    });
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.get('/setting/:key', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).then(function (user) {
    res.json({
      key: req.params.key,
      value: user.settings[req.params.key] || null
    });
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.post('/setting/:key', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).then(function (user) {
    user.settings[req.params.key] = req.body.value;
    user.save(function (err) {
      if (err) return errorHandler(err);
      res.json({
        message: 'Setting updated'
      });
    });
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.get('/profile', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).then(function (user) {
    res.json({
      profile: user.profile
    });
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.get('/profile/:key', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).then(function (user) {
    res.json({
      key: req.params.key,
      value: user.profile[req.params.key] || null
    });
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.post('/profile/:key', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).then(function (user) {
    user.profile[req.params.key] = req.body.value;
    user.save(function (err) {
      if (err) return errorHandler(err);
      res.json({
        message: 'Profile updated'
      });
    });
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.get('/username', function (req, res) {
  _User["default"].findOne({
    id: req.user.id
  }).select('username').then(function (user) {
    res.json(user.username);
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.get('/username/availability', function (req, res) {
  _User["default"].countDocuments({
    username: req.body.username
  }).then(function (count) {
    if (count !== 0) return res.status(406).json({
      error: 'Username is unavailable'
    });
    return res.json({
      message: 'Username is available'
    });
  })["catch"](function (err) {
    return errorHandler(err, res);
  });
});
router.patch('/username', function (req, res) {
  _User["default"].countDocuments({
    username: req.body.username
  }).then(function (count) {
    if (count !== 0) return res.status(406).json({
      error: 'Username is unavailable'
    });

    _User["default"].findOneAndUpdate({
      id: req.user.id
    }, {
      username: req.body.username
    }).then(function (user) {
      return res.json({
        message: 'Username updated successfully'
      });
    })["catch"](function (err) {
      return errorHandler(err, res);
    });
  });
});
router.post('/update-password', function (req, res) {
  var _req$body3 = req.body,
      currentPassword = _req$body3.currentPassword,
      newPassword = _req$body3.newPassword,
      confirmPassword = _req$body3.confirmPassword;

  _User["default"].findOne({
    id: req.user.id
  }).then(function (user) {
    if (user.validPassword(currentPassword)) {
      if (newPassword === confirmPassword) {
        _bcryptjs["default"].hash(newPassword, 10, function (err, hash) {
          if (err) {
            console.error(err);
            return res.status(500).json({
              error: 'Error hashing your password'
            });
          }

          user.password = hash;
          user.save(function (err) {
            if (err) return res.status(500).json({
              error: 'There was an error saving your new password'
            });
            return res.json({
              message: 'Your password has been updated!'
            });
          });
        });
      } else {
        return res.status(400).json({
          error: 'New passwords did not match'
        });
      }
    } else {
      return res.status(400).json({
        error: 'Current password is invalid'
      });
    }
  });
});
var _default = router;
exports["default"] = _default;