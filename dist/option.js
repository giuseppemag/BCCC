"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Immutable = require("immutable");
var CCC = require("./ccc");
exports.none = function () { return CCC.apply(CCC.fun(CCC.unit).then(CCC.inr()), null); };
exports.some = function (x) { return CCC.apply(CCC.inl(), x); };
exports.map = function (p, f) {
    return CCC.apply(CCC.fun(function (x) { return exports.some(f(x)); }).plus(CCC.fun(function (_) { return exports.none(); })), p);
};
exports.to_array = function (p) {
    return CCC.apply(CCC.fun(function (x) { return [x]; }).plus(CCC.fun(function (_) { return []; })), p);
};
exports.to_list = function (p) {
    return Immutable.List(exports.to_array(p));
};
exports.merge = function (f, g) {
    return function (s) { return CCC.apply(CCC.fun(f).then(CCC.id().map_plus(CCC.fun(function (_) { return g(s); }))), s); };
};
//# sourceMappingURL=option.js.map