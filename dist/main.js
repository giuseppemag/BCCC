"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Exp = function (f) {
    var f_exp = f;
    f_exp.then = function (g) {
        var _this = this;
        return Exp(function (a) { return g(_this(a)); });
    };
    return f_exp;
};
var id = function () { return Exp(function (a) { return a; }); };
var FMap = function () { return function (fmap) {
    var f_FMap = fmap;
    f_FMap.fmap = fmap;
    f_FMap.then = function (gmap) {
        var _this = this;
        return FMap()(function (f) { return gmap.fmap(_this.fmap(f)); });
    },
        f_FMap.after = function (gmap) {
            var _this = this;
            return FMap()(function (f) { return _this.fmap(gmap.fmap(f)); });
        };
    return f_FMap;
}; };
var BaseFunctorMaps = function () { return ({
    Id: id(),
    Array: Exp(function (f) { return Exp(function (as) { return as.map(f); }); }),
    List: Exp(function (f) { return Exp(function (as) { return as.map(function (a) { return f(a); }).toList(); }); }),
    Option: Exp(function (f) { return Exp(function (oa) { return oa.kind == "none" ? ({ kind: "none" }) : ({ kind: "some", value: f(oa.value) }); }); }),
}); };
var fmap = function (functor) {
    return FMap()(function (f) { return BaseFunctorMaps()[functor](f); });
};
var f1 = fmap("Array")(Exp(function (x) { return x % 2 == 0; }));
var f2 = fmap("Array").after(fmap("Array")).after(fmap("Array"))(Exp(function (x) { return x % 2 == 0; }));
var some = function (x) { return ({ kind: "some", value: x }); };
var none = function () { return ({ kind: "none" }); };
var input = some([[some(1), some(2), some(3), none(), some(4)], [none(), some(5)]]);
var f3 = fmap("Option").after(fmap("Array")).after(fmap("Array")).after(fmap("Option"))(Exp(function (x) { return x % 2 == 0; }));
var test = f3(input);
console.log("Hi!");
var f = null;
//# sourceMappingURL=main.js.map