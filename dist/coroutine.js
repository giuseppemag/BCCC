"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ccc_1 = require("./ccc");
var CCC = require("./ccc");
exports.error = function () { return ccc_1.inl(); };
exports.no_error = function () { return ccc_1.inr(); };
exports.continuation = function () { return ccc_1.inl(); };
exports.result = function () { return ccc_1.inr(); };
exports.value = function () { return CCC.id(); };
exports.mk_coroutine = function (run) {
    return ({
        run: run,
        then: function (k) {
            var f = ccc_1.curry(ccc_1.snd().then(ccc_1.fun(k)));
            var g = ccc_1.id().times(f);
            var h = g.then(map_fun()).then(join_fun());
            return CCC.apply(h, this);
        },
        ignore: function () {
            return this.ignore_with(CCC.unit().f(null));
        },
        ignore_with: function (y) {
            var f = ccc_1.curry(ccc_1.snd().then(ccc_1.constant(y)));
            var g = ccc_1.id().times(f);
            var h = g.then(map_fun());
            return CCC.apply(h, this);
        },
        map: function (f) {
            return exports.mk_coroutine(CCC.id().map_plus(CCC.apply(ccc_1.curry(map_fun().after(CCC.swap_prod())), f).map_times(CCC.id()).map_plus(f.map_times(CCC.id()))).after(this.run));
        }
    });
};
var map_fun = function () { return ccc_1.fun(function (p) { return p.fst.map(p.snd); }); };
exports.from_state = function (p) {
    return exports.mk_coroutine(p.run.then(exports.result().then(exports.no_error())));
};
exports.run = function () { return ccc_1.fun(function (p) { return p.run; }); };
var join_fun = function () { return ccc_1.fun(function (c) { return exports.join(c); }); };
exports.join = function (pp) {
    var f = exports.error().plus(ccc_1.fst().then(join_fun()).times(ccc_1.snd()).then(exports.continuation().then(exports.no_error())).plus(ccc_1.fun(function (prv) { return CCC.apply(prv.fst.run.then(exports.error().plus(exports.no_error().after(exports.continuation()).plus(exports.no_error().after(exports.result())))), prv.snd); })));
    var g = ccc_1.apply(ccc_1.curry(exports.run().map_times(ccc_1.id()).then(ccc_1.apply_pair()).then(f)), pp);
    return exports.mk_coroutine(g);
};
exports.unit = function (x) {
    return exports.mk_coroutine(exports.no_error().after(exports.result()).after(ccc_1.constant(x).times(ccc_1.id())));
};
var unit_fun = function () { return CCC.fun(function (x) { return exports.unit(x); }); };
exports.suspend = function () {
    return exports.mk_coroutine(exports.no_error().after(exports.continuation().after(unit_fun().after(CCC.unit().times(ccc_1.id())).times(ccc_1.id()))));
};
exports.incr = function (x) {
    return x.get.then(function (x_v) {
        return x.set(x_v + 1).then(function (_) {
            return x.get;
        });
    });
};
//# sourceMappingURL=coroutine.js.map