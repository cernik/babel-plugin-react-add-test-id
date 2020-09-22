"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var t = _interopRequireWildcard(require("@babel/types"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _default(api, _ref) {
  var _ref$attrName = _ref.attrName,
      attrName = _ref$attrName === void 0 ? "data-test-id" : _ref$attrName,
      _ref$mode = _ref.mode,
      mode = _ref$mode === void 0 ? "regular" : _ref$mode,
      _ref$ignoreElements = _ref.ignoreElements,
      ignoreElements = _ref$ignoreElements === void 0 ? ["div", "input", "a", "button", "span", "p", "br", "hr", "ul", "ol", "li", "img", "form", "h1", "h2", "h3", "h4", "h5", "h6", "svg", "path", "g"] : _ref$ignoreElements,
      _ref$additionalIgnore = _ref.additionalIgnoreElements,
      additionalIgnoreElements = _ref$additionalIgnore === void 0 ? [] : _ref$additionalIgnore,
      _ref$delimiter = _ref.delimiter,
      delimiter = _ref$delimiter === void 0 ? "-" : _ref$delimiter;
  var isRootElement = true;
  return {
    visitor: {
      Program: function Program(path) {
        path.traverse({
          ClassDeclaration: function ClassDeclaration(path) {
            isRootElement = true;
            var componentName = path.node.id.name;
            passDownComponentName(path, componentName, mode, delimiter);
          },
          VariableDeclarator: function VariableDeclarator(path) {
            isRootElement = true;
            var componentName = path.node.id.name;
            passDownComponentName(path, componentName, mode, delimiter);
          },
          JSXElement: function JSXElement(path) {
            var componentName = path.node.openingElement.name.name || "";
            var isRoot = isRootElement || path.parent.type === "ReturnStatement";
            var isIgnoredElement = [].concat(_toConsumableArray(ignoreElements), _toConsumableArray(additionalIgnoreElements)).includes(componentName);

            if (componentName === "" || componentName.includes("Fragment") || !isRoot && isIgnoredElement) {
              return;
            } // if has a key get its value


            var keyValue = getKey(path);

            if (path.parent.childrenCount) {
              path.parent.counter = path.parent.counter + 1;
            }

            var counter = mode === "full" ? path.parent.counter : 0;
            var concatComponentName = concatComponentsName(path.node.componentName, isIgnoredElement ? "" : componentName, delimiter, keyValue, counter);
            isRootElement = false;
            var testId = keyValue ? t.jsxExpressionContainer(t.identifier(concatComponentName)) : t.stringLiteral(concatComponentName);
            path.node.openingElement.attributes.push(t.jSXAttribute(t.jSXIdentifier(attrName), testId));
            mode === "full" && passDownComponentName(path, componentName, mode, delimiter);
          }
        });
      }
    }
  };
}

var concatComponentsName = function concatComponentsName() {
  var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var current = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var delimiter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "-";
  var keyValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
  var suffix = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
  var componentsName = parent && current ? "".concat(parent).concat(delimiter).concat(current) : parent || current;
  var ret = keyValue ? "`".concat(componentsName).concat(delimiter, "${").concat(keyValue, "}`") : componentsName;
  return suffix ? "".concat(ret).concat(delimiter).concat(suffix) : ret;
};

var passDownComponentName = function passDownComponentName(path, componentName, mode, delimiter) {
  var isRootElement = true;
  path.traverse({
    JSXElement: function JSXElement(path) {
      if (mode === "minimal") {
        path.node.componentName = isRootElement || path.parent.type === "ReturnStatement" ? concatComponentsName(path.node.componentName, componentName, delimiter) : null;
      } else {
        path.node.componentName = concatComponentsName(path.node.componentName, componentName, delimiter);
        path.node.childrenCount = (path.node.children || []).filter(function (_ref2) {
          var type = _ref2.type;
          return type === "JSXElement";
        }).length;
        path.parent.counter = 0;
      }

      isRootElement = false;
    }
  });
};

var getKey = function getKey(path) {
  var keyAttribute = path.node.openingElement.attributes.find(function (_ref3) {
    var name = _ref3.name;
    return name && name.name === "key";
  });
  var keyValue = keyAttribute && keyAttribute.value && keyAttribute.value.expression ? keyAttribute.value.expression.name : "";
  return keyValue;
};