"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _default =
/*#__PURE__*/
function () {
  function _default(options) {
    _classCallCheck(this, _default);

    this.name = options.name || 'Example Helio Mod';

    var router = this.router = _express["default"].Router(); // Comment the next line out if you don't want any public paths, or modify as needed


    this.publicPaths = [options.path, new RegExp("^".concat(options.path, "/.*"))]; // Setup your routes here; bind(this) if you need access to the mod itself

    router.get('/', this.index.bind(this));
    router.get('/add/:x/:y', this.add);
    router.get('/test-error', this.testError); // This is the mod's error handler

    var self = this;
    router.use(function (err, req, res, next) {
      console.error("[MOD ERROR] (".concat(self.name, ")"), err.stack);
      return res.status(500).json({
        error: err.toString()
      });
    });
  } // Now implement your route methods:


  _createClass(_default, [{
    key: "index",
    value: function index(req, res, next) {
      var user = req.user;
      res.json({
        mod: this.name,
        user: user
      });
    }
  }, {
    key: "add",
    value: function add(req, res, next) {
      var _req$params = req.params,
          x = _req$params.x,
          y = _req$params.y;
      x = parseFloat(x);
      y = parseFloat(y);
      res.json(x + y);
    }
  }, {
    key: "testError",
    value: function testError(req, res, next) {
      next(new Error('Intentional Error'));
    }
  }]);

  return _default;
}();

exports["default"] = _default;