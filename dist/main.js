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
var BaseFunctorMaps = function () { return ({
    Id: id(),
    Array: Exp(function (f) { return Exp(function (as) { return as.map(f); }); }),
    List: Exp(function (f) { return Exp(function (as) { return as.map(function (a) { return f(a); }).toList(); }); }),
    Option: Exp(function (f) { return Exp(function (oa) { return oa.kind == "none" ? ({ kind: "none" }) : ({ kind: "some", value: f(oa.value) }); }); }),
}); };
var fmap = function (functor) { return function (f) {
    return BaseFunctorMaps()[functor](f);
}; };
// interface Nat<f extends keyof BaseFunctors<{}>, g extends keyof BaseFunctors<{}>> {
//   actual:<a>() => Exp<BaseFunctors<a>[f], BaseFunctors<a>[g]>,
//   then:<h extends keyof BaseFunctors<{}>>(g:Nat<g,h>) => Nat<f, h>
// }
// const Nat = <f extends keyof BaseFunctors<{}>, g extends keyof BaseFunctors<{}>>() => <a>(actual:<a>() => Exp<BaseFunctors<a>[f], BaseFunctors<a>[g]>) : Nat<f,g> => ({
//   actual,
//   then:function<h extends keyof BaseFunctors<{}>>(this:Nat<f,g>, g:Nat<g,h>) : Nat<f, h> {
//     return Nat<f,h>()(() => this.actual().then(g.actual()) as unknown as any)
//   }
// })
// type MonadUnit<m extends keyof BaseFunctors<{}>, a> = Nat<"Id", m>
// type MonadJoin<m extends keyof BaseFunctors<{}>, a> = Nat<Then<m,m>, m>
// Monads = subset of keyof BaseFunctor
// MonadInstance = { [m in Monads] : { unit:MonadUnit<m>, join:MonadJoin<m> } }
