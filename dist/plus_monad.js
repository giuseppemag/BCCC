"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ccc_1 = require("./ccc");
exports.map_plus_left = function () {
    var f = ccc_1.id().times(ccc_1.constant(ccc_1.id()));
    return f.then(ccc_1.plus_par_cat());
};
exports.map_plus_right = function () {
    var f = ccc_1.constant(ccc_1.id()).times(ccc_1.id());
    return f.then(ccc_1.plus_par_cat());
};
