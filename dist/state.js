"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ccc_1 = require("./ccc");
var CCC = require("./ccc");
exports.mk_state = function (run) {
    return ({
        run: run,
        then: function (k) {
            return exports.st_join(this.map(ccc_1.fun(k)));
        },
        ignore: function () {
            return this.ignore_with(CCC.unit().f({}));
        },
        ignore_with: function (y) {
            return this.map(ccc_1.constant(y));
        },
        map: function (f) {
            return exports.mk_state(f.map_times(CCC.id()).after(this.run));
        }
    });
};
exports.st_run = function () { return ccc_1.fun(function (p) { return p.run; }); };
exports.st_join = function (pp) {
    var g = ccc_1.fst().then(exports.st_run()).times(ccc_1.snd()).then(ccc_1.apply_pair());
    var h = exports.st_run().map_times(ccc_1.id()).then(ccc_1.apply_pair()).then(g);
    return exports.mk_state(ccc_1.apply(ccc_1.curry(h), pp));
};
exports.st_unit = function (x) { return exports.mk_state(ccc_1.constant(x).times(ccc_1.id())); };
// export let incr : <S>(_:StRef<S, number>) => State<S,number> = x =>
//   x.get.then(x_v =>
//   x.set(x_v + 1).then(_ =>
//   x.get))
