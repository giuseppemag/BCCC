"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ccc_1 = require("./ccc");
var CCC = require("./ccc");
exports.mk_state = function (run) {
    return ({
        run: run,
        then: function (k) {
            return exports.join(this.map(ccc_1.fun(k)));
        },
        ignore: function () {
            return this.ignore_with(CCC.unit().f(null));
        },
        ignore_with: function (y) {
            return this.map(ccc_1.constant(y));
        },
        map: function (f) {
            return exports.mk_state(f.map_times(CCC.id()).after(this.run));
        }
    });
};
var run = function () { return ccc_1.fun(function (p) { return p.run; }); };
exports.join = function (pp) {
    var g = ccc_1.fst().then(run()).times(ccc_1.snd()).then(ccc_1.apply_pair());
    var h = run().map_times(ccc_1.id()).then(ccc_1.apply_pair()).then(g);
    return exports.mk_state(ccc_1.apply(ccc_1.curry(h), pp));
};
exports.unit = function (x) { return exports.mk_state(ccc_1.constant(x).times(ccc_1.id())); };
exports.incr = function (x) {
    return x.get.then(function (x_v) {
        return x.set(x_v + 1).then(function (_) {
            return x.get;
        });
    });
};
//# sourceMappingURL=state.js.map