"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.id = function () { return exports.fun(function (x) { return x; }); };
exports.constant = function (a) { return exports.fun(function (x) { return a; }); };
exports.absurd = function () { return exports.fun(function (_) { throw "Does not exist."; }); };
exports.unit = function () { return exports.fun(function (x) { return ({}); }); };
var plus = function (f, g) { return function (x) { return x.kind == "left" ? f(x.value) : g(x.value); }; };
var plus_par = function (f, g) { return function (x) { return x.kind == "left" ? exports.inl().f(f(x.value)) : exports.inr().f(g(x.value)); }; };
// export let mk_pair = <a,b>(x:a) : (y:b) => Prod<a,b> => y => ({ fst:x, snd:y })
var times = function (f, g) { return function (x) { return ({ fst: f(x), snd: g(x) }); }; };
var times_par = function (f, g) { return function (x) { return ({ fst: f(x.fst), snd: g(x.snd) }); }; };
exports.fun = function (f) { return ({
    f: f,
    after: function (g) {
        var _this = this;
        return exports.fun(function (x) { return _this.f(g.f(x)); });
    },
    then: function (g) {
        var _this = this;
        return exports.fun(function (x) { return g.f(_this.f(x)); });
    },
    plus: function (g) { return exports.fun(plus(this.f, g.f)); },
    map_plus: function (g) { return exports.fun(plus_par(this.f, g.f)); },
    times: function (g) { return exports.fun(times(this.f, g.f)); },
    map_times: function (g) { return exports.fun(times_par(this.f, g.f)); },
    map_times_left: function () { return exports.apply(map_times_left(), this); },
    map_times_right: function () { return exports.apply(exports.map_times_right(), this); },
    map_sum_left: function () { return exports.apply(exports.map_sum_left(), this); },
    map_sum_right: function () { return exports.apply(exports.map_sum_right(), this); },
}); };
exports.defun = function (f) { return f.f; };
exports.apply = function (f, x) { return f.f(x); };
exports.apply_pair = function () { return exports.fun(function (p) { return p.fst.f(p.snd); }); };
exports.curry = function (f) { return exports.fun(function (a) { return exports.fun(function (b) { return f.f({ fst: a, snd: b }); }); }); };
exports.uncurry = function (f) {
    var g = exports.fst().times(exports.snd().then(exports.fst())).then(exports.apply_pair()).times(exports.snd().then(exports.snd())).then(exports.apply_pair());
    return exports.apply(exports.curry(g), f);
};
exports.exp = exports.fun;
exports.fst = function () { return exports.fun(function (p) { return p.fst; }); };
exports.snd = function () { return exports.fun(function (p) { return p.snd; }); };
exports.inl = function () { return exports.fun(function (x) { return ({ kind: "left", value: x }); }); };
exports.inr = function () { return exports.fun(function (x) { return ({ kind: "right", value: x }); }); };
// a * (b+c) = a*b + a*c
exports.distribute_sum_prod = function () {
    return exports.id().map_times(exports.curry(exports.inl().after(exports.snd().times(exports.fst()))).plus(exports.curry(exports.inr().after(exports.snd().times(exports.fst()))))).then(exports.swap_prod().then(exports.apply_pair()));
};
exports.distribute_sum_prod_inv = function () {
    return exports.fst().times(exports.inl().after(exports.snd())).plus(exports.fst().times(exports.inr().after(exports.snd())));
};
// a^(b+c) = a^b * a^c
exports.distribute_exp_sum = function () {
    return exports.curry(exports.id().map_times(exports.inl()).then(exports.apply_pair())).times(exports.curry(exports.id().map_times(exports.inr()).then(exports.apply_pair())));
};
exports.distribute_exp_sum_inv = function () {
    return exports.curry(exports.distribute_sum_prod().then(exports.apply_pair().after(exports.fst().map_times(exports.id())).plus(exports.apply_pair().after(exports.snd().map_times(exports.id())))));
};
exports.distribute_exp_prod = function () {
    return exports.curry(exports.apply_pair().after(exports.fst().times(exports.fst().after(exports.snd()))).times(exports.snd().after(exports.snd())).then(exports.apply_pair()));
};
exports.distribute_exp_prod_inv = function () {
    var f = exports.fst().then(exports.fst());
    var g = exports.fst().then(exports.snd());
    var h = exports.snd();
    return exports.curry(exports.curry(f.times(g.times(h)).then(exports.apply_pair())));
};
// a^0 = 1
exports.power_of_zero = function () {
    return exports.unit();
};
exports.power_of_zero_inv = function () {
    return exports.curry(exports.absurd().after(exports.snd()));
};
// a^1 = a
// a*1 = 1*a = a
// a+0 = 0+a = a
// a*a = a^2
// c^b^a = c^a^b
exports.swap_exp_args = function () {
    var f = exports.curry(exports.id().map_times(exports.swap_prod()).then(exports.apply_pair()));
    return exports.distribute_exp_prod().then(f).then(exports.distribute_exp_prod_inv());
};
// a*b = b*a
exports.swap_prod = function () {
    return exports.snd().times(exports.fst());
};
// a+b = b+a
exports.swap_sum = function () { return exports.inr().plus(exports.inl()); };
// _*c
var map_times_left = function () {
    var f = exports.fst().times(exports.snd().then(exports.fst())).then(exports.apply_pair());
    var g = exports.snd().then(exports.snd());
    return exports.curry(f.times(g));
};
// c*_
exports.map_times_right = function () {
    var f = exports.fst().times(exports.snd().then(exports.snd())).then(exports.apply_pair());
    var g = exports.snd().then(exports.fst());
    var h = (f.times(g));
    return undefined;
};
// _+c
exports.map_sum_left = function () {
    var f = exports.distribute_sum_prod();
    var g = exports.apply_pair();
    var h = exports.snd();
    var i = g.map_plus(h);
    return exports.curry(f.then(i));
};
// c+_
exports.map_sum_right = function () {
    var f = exports.distribute_sum_prod();
    var g = exports.apply_pair();
    var h = exports.snd();
    var i = h.map_plus(g);
    return exports.curry(f.then(i));
};
// _^c is not needed: it is f.then
// c^_ is not needed: it is f.after
exports.lazy = function (x) { return exports.curry((exports.id().map_times(x)).then(exports.snd())); };
exports.compose_pair = function () {
    var f = exports.fst().map_times(exports.id()).then(exports.apply_pair());
    var g = exports.fst().then(exports.snd());
    return exports.curry(g.times(f).then(exports.apply_pair()));
};
//# sourceMappingURL=ccc.js.map