"use strict";
var Fun = function (f) {
    var _f = f;
    _f.then = function (g) {
        var _this = this;
        return Fun(function (a) { return g(_this(a)); });
    };
    return _f;
};
var f = Fun(function (x) { return x + 1; });
console.log(f(10));
