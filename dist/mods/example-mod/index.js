"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Only necessary if you need to extend inbound models
var _default =
/*#__PURE__*/
function () {
  function _default(options) {
    _classCallCheck(this, _default);

    this.options = options;
    this.name = options.name || 'Example Helio Mod';

    var router = this.router = _express["default"].Router(options.routerOptions); // Comment the next line out if you don't want any public paths, or modify as needed


    this.publicPaths = [options.path, new RegExp("^".concat(options.path, "/.*"))]; // Everything is public
    // Specify which models you need in this mod

    this.needModels = ['User']; // This defines schemas used to create submodels, which inherit from the parent model
    // format: { ParentModelName: new mongoose.Schema({ newProperty: MongooseSchemaType }) }

    this.subSchemas = {
      User: new _mongoose["default"].Schema({
        myData: {
          field1: String,
          field2: {
            type: Number,
            required: true
          },
          field3: {
            type: Date,
            "default": Date.now
          },
          field4: Boolean,
          field5: [{
            type: String,
            "default": 'Field5 Data'
          }]
        }
      }) // Setup your routes here; bind(this) if you need access to the mod itself

    };
    router.get('/', this.index.bind(this));
    router.get('/add/:x/:y', this.add);
    router.get('/test-error', this.testError); // This is the mod's error handler

    var self = this;
    router.use(function (err, req, res, next) {
      req.Log.error("[MOD ERROR] (".concat(self.name, ") ").concat(err.stack));
      return res.status(500).json({
        error: err.toString()
      });
    });
  } // This function receives models requested with this.needModels
  // Access them in route methods with this.models.ModelName


  _createClass(_default, [{
    key: "receiveModels",
    value: function receiveModels(models) {
      var _this = this;

      this.models = {};
      this.subModels = {}; // This will assign each model to this.models.ModelName

      models.forEach(function (model) {
        _this.models[model.name] = model.model;
      }); // This will generate submodels based on this.subSchemas
      // In your route methods, access submodels with this.subModels.ModelName; eg. this.subModels.User

      for (var parentModelName in this.subSchemas) {
        var parentModel = this.models[parentModelName];
        var subSchema = this.subSchemas[parentModelName];
        this.subModels[parentModelName] = parentModel.discriminator(this.name, subSchema);
      }
    } // Now implement your route methods:

  }, {
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