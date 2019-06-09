"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _uuid = require("uuid");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _default =
/*#__PURE__*/
function () {
  function _default(options) {
    _classCallCheck(this, _default);

    this.options = options;
    this.name = options.name || 'Helio Blog Mod';

    var router = this.router = _express["default"].Router();

    this.needModels = ['BlogPost'];
    this.subSchemas = {
      BlogPost: new _mongoose["default"].Schema({
        owner: String,
        "public": {
          type: Boolean,
          "default": true
        },
        title: {
          type: String,
          required: true
        },
        excerpt: String,
        content: {
          type: String,
          required: true
        }
      })
    };
    this.subSchemas.BlogPost.options.toJSON = {
      transform: function transform(doc, ret, options) {
        delete ret._id;
        delete ret.__v;
        delete ret.__t;
        return ret;
      }
    };
    router.get('/', this.getAllMyPosts.bind(this));
    router.post('/', this.addPost.bind(this));
    router.get('/:id', this.getPost.bind(this));
    router.patch('/:id', this.updatePost.bind(this));
    router["delete"]('/:id', this.deletePost.bind(this));
    var self = this;
    router.use(function (err, req, res, next) {
      req.Log.error("[MOD ERROR] (".concat(self.name, ") ").concat(err.stack));
      return res.status(500).json({
        error: err.toString()
      });
    });
  }

  _createClass(_default, [{
    key: "receiveModels",
    value: function receiveModels(models) {
      var _this = this;

      this.models = {};
      this.subModels = {};
      models.forEach(function (model) {
        _this.models[model.name] = model.model;
      });

      for (var parentModelName in this.subSchemas) {
        var parentModel = this.models[parentModelName];
        var subSchema = this.subSchemas[parentModelName];
        this.subModels[parentModelName] = parentModel.discriminator(this.name, subSchema);
      }
    }
  }, {
    key: "getAllMyPosts",
    value: function () {
      var _getAllMyPosts = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(req, res, next) {
        var posts;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return this.subModels.BlogPost.find({
                  owner: req.user.id
                }).sort({
                  createdAt: 'desc'
                });

              case 3:
                posts = _context.sent;
                res.json(posts);
                _context.next = 10;
                break;

              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](0);
                next(_context.t0);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 7]]);
      }));

      function getAllMyPosts(_x, _x2, _x3) {
        return _getAllMyPosts.apply(this, arguments);
      }

      return getAllMyPosts;
    }()
  }, {
    key: "addPost",
    value: function () {
      var _addPost = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(req, res, next) {
        var post;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                post = new this.subModels.BlogPost({
                  id: (0, _uuid.v4)(),
                  owner: req.user.id,
                  "public": req.body["public"] || true,
                  title: req.body.title || 'Untitled Blog Post',
                  excerpt: req.body.excerpt ? req.body.excerpt.substring(0, 256) : req.body.content.length > 256 ? req.body.content.substring(0, 256) + '...' : null,
                  content: req.body.content
                });
                _context2.next = 4;
                return post.save();

              case 4:
                res.json(post);
                _context2.next = 10;
                break;

              case 7:
                _context2.prev = 7;
                _context2.t0 = _context2["catch"](0);
                next(_context2.t0);

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 7]]);
      }));

      function addPost(_x4, _x5, _x6) {
        return _addPost.apply(this, arguments);
      }

      return addPost;
    }()
  }, {
    key: "getPost",
    value: function () {
      var _getPost = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(req, res, next) {
        var post;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return this.subModels.BlogPost.findOne({
                  id: req.params.id,
                  $or: [{
                    owner: req.user.id
                  }, {
                    "public": true
                  }]
                });

              case 3:
                post = _context3.sent;

                if (post) {
                  _context3.next = 6;
                  break;
                }

                return _context3.abrupt("return", res.status(404).json({
                  error: 'Post not found'
                }));

              case 6:
                res.json(post);
                _context3.next = 12;
                break;

              case 9:
                _context3.prev = 9;
                _context3.t0 = _context3["catch"](0);
                next(_context3.t0);

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 9]]);
      }));

      function getPost(_x7, _x8, _x9) {
        return _getPost.apply(this, arguments);
      }

      return getPost;
    }()
  }, {
    key: "updatePost",
    value: function () {
      var _updatePost = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(req, res, next) {
        var updatedPost;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                _context4.next = 3;
                return this.subModels.BlogPost.findOneAndUpdate({
                  id: req.params.id,
                  owner: req.user.id
                }, _objectSpread({}, req.body), {
                  "new": true
                });

              case 3:
                updatedPost = _context4.sent;
                res.json(updatedPost);
                _context4.next = 10;
                break;

              case 7:
                _context4.prev = 7;
                _context4.t0 = _context4["catch"](0);
                next(_context4.t0);

              case 10:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[0, 7]]);
      }));

      function updatePost(_x10, _x11, _x12) {
        return _updatePost.apply(this, arguments);
      }

      return updatePost;
    }()
  }, {
    key: "deletePost",
    value: function () {
      var _deletePost = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return this.subModels.BlogPost.findOneAndRemove({
                  id: req.params.id,
                  owner: req.user.id
                });

              case 3:
                result = _context5.sent;
                res.json(result);
                _context5.next = 10;
                break;

              case 7:
                _context5.prev = 7;
                _context5.t0 = _context5["catch"](0);
                next(_context5.t0);

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[0, 7]]);
      }));

      function deletePost(_x13, _x14, _x15) {
        return _deletePost.apply(this, arguments);
      }

      return deletePost;
    }()
  }]);

  return _default;
}();

exports["default"] = _default;