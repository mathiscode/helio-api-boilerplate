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

    this.name = options.name || 'Example Minimal Helio Mod';

    var router = this.router = _express["default"].Router();

    this.publicPaths = [options.path];
    router.get('/', this.index.bind(this));
    var self = this;
    router.use(function (err, req, res, next) {
      req.Log.error("[MOD ERROR] (".concat(self.name, ") ").concat(err.stack));
      return res.status(500).json({
        error: err.toString()
      });
    });
  }

  _createClass(_default, [{
    key: "index",
    value: function index(req, res, next) {
      var user = req.user;
      res.json({
        mod: this.name,
        user: user
      });
    }
  }]);

  return _default;
}();

exports["default"] = _default;