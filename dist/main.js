"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var Fun = function (f) {
    var f_exp = f;
    f_exp.then = function (g) {
        var _this = this;
        return Fun(function (a) { return g(_this(a)); });
    };
    return f_exp;
};
var id = function () { return Fun(function (a) { return a; }); };
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
    Array: Fun(function (f) { return Fun(function (as) { return as.map(f); }); }),
    List: Fun(function (f) { return Fun(function (as) { return as.map(function (a) { return f(a); }).toList(); }); }),
    Option: Fun(function (f) { return Fun(function (oa) { return oa.kind == "none" ? ({ kind: "none" }) : ({ kind: "some", value: f(oa.value) }); }); }),
}); };
var fmap = function (functor) {
    return FMap()(function (f) { return BaseFunctorMaps()[functor](f); });
};
var f1 = fmap("List").after(fmap("Option"))(Fun(function (x) { return x % 2 == 0; }));
var f2 = fmap("Option").after(fmap("List")).after(fmap("List"))(Fun(function (x) { return x % 2 == 0; }));
var Nat = function () { return function (actual) { return ({
    actual: actual,
    then: function (g) {
        var _this = this;
        return Nat()(function () { return _this.actual().then(g.actual()); });
    },
    after: function (g) {
        var _this = this;
        return Nat()(function () { return g.actual().then(_this.actual()); });
    },
    above: function (hmap) {
        var _this = this;
        return Nat()(function () { return hmap(_this.actual()); });
    },
    below: function (hmap) {
        var _this = this;
        return Nat()(function () { return _this.actual(); });
    }
}); }; };
// type Prod<a> = <b>() => [a,b]
// type Sum<a> = <b>() => { kind:"left", value:a } | { kind:"right", value:b }
// const V1 : Prod<number> = null!
// const V2 = V1<number>()
var some = function (value) { return ({ kind: "some", value: value }); };
var none = function () { return ({ kind: "none" }); };
var input = some([[some(1), some(2), some(3), none(), some(4)], [none(), some(5)]]);
var f3 = fmap("Option").after(fmap("Array")).after(fmap("Array")).after(fmap("Option"))(Fun(function (x) { return x % 2 == 0; }));
var head = Nat()(function () { return Fun(function (l) { return l.isEmpty() ? none() : some(l.get(0)); }); });
var o2l = Nat()(function () { return Fun(function (o) { return o.kind == "none" ? immutable_1.List() : immutable_1.List([o.value]); }); });
var input2 = immutable_1.List([1, 2, 3, 4, 5]);
var out1 = head.actual()(input2);
var out2 = head.then(o2l).actual()(input2);
var ttt = head.actual();
var whoah = head.above(fmap("Array")).above(fmap("Option")).actual();
var haohw = head.below(fmap("Array")).above(fmap("Array")).actual();
var out3 = whoah(some([immutable_1.List([1, 2]), immutable_1.List([3]), immutable_1.List([4, 5, 6]), immutable_1.List()]));
var out4 = haohw([immutable_1.List([[1], [2]]), immutable_1.List([[3]]), immutable_1.List(), immutable_1.List([[4, 5], [6]])]);
var test = f3(input);
console.log("Hi!");
var f = null.above(fmap("Array")).actual();
//# sourceMappingURL=main.js.map