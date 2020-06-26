"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var Fun = function (f) {
    var _f = f;
    _f.then = function (g) {
        var _this = this;
        return Fun(function (a) { return g(_this(a)); });
    };
    return _f;
};
var Nat = function (f) { return Fun(f); };
var id = function () { return Nat(function (a) { return a; }); };
var singleton = function () { return Nat(function (a) { return immutable_1.List().push(a); }); };
var join = function () { return Nat(function (l) { return l.flatMap(function (x) { return x; }).toList(); }); };
// functor
// monad
// interface Eta<a,f> extends Nat<a,f<a>> {
//   (a:a) : f<a>,
//   then<c>(g:Nat<f<a>,c>) : Nat<a,c>
// }
// interface Mu<a,f> extends Nat<f<f<a>>, f<a>> {
//   (ffa:f<f<a>>) : f<a>,
//   then<c>(g:Nat<f<a>,c>) : Nat<a,c>
// }
// const Eta = <a, Functor f>(f:Nat<a,f<a>>) : Nat<a,f<a>> => ...
