import { List } from "immutable"

interface Exp<a,b> {
  (a:a) : b,
  then:<c>(g:Exp<b,c>) => Exp<a,c>
}

const Exp = <a,b>(f:(a:a) => b) : Exp<a,b> => {
  const f_exp = f as Exp<a,b>
  f_exp.then = function<c>(this:Exp<a,b>, g:Exp<b,c>) : Exp<a,c> {
    return Exp(a => g(this(a)))
  }
  return f_exp
}

const id = <a>() : Exp<a,a> => Exp(a => a)

type Id<a> = a
type Option<a> = { kind:"some", value:a } | { kind:"none" }

interface BaseFunctors<a> {
  Id: Id<a>
  Array: Array<a>
  List : List<a>
  Option: Option<a>
}

type BaseFunctorMap<f extends keyof BaseFunctors<{}>, a, b> = Exp<Exp<a,b>, Exp<BaseFunctors<a>[f], BaseFunctors<b>[f]>>

type BaseFunctorMaps<a, b> = {
  [f in keyof BaseFunctors<{}>]:BaseFunctorMap<f, a, b>
}

const BaseFunctorMaps = <a,b>() : BaseFunctorMaps<a, b> => ({
  Id: id(),
  Array: Exp(f => Exp(as => as.map(f))),
  List : Exp(f => Exp(as => as.map(a => f(a!)).toList())),
  Option: Exp(f => Exp(oa => oa.kind == "none" ? ({ kind:"none"}) : ({ kind:"some", value:f(oa.value) }))),
})

const fmap = <f extends keyof BaseFunctors<{}>>(functor:f) => <a,b>(f:Exp<a,b>) : Exp<BaseFunctors<a>[f], BaseFunctors<b>[f]> => 
  BaseFunctorMaps<a,b>()[functor](f) as unknown as Exp<BaseFunctors<a>[f], BaseFunctors<b>[f]>


interface Nat<f extends keyof BaseFunctors<{}>, g extends keyof BaseFunctors<{}>> {
  actual:<a>() => Exp<BaseFunctors<a>[f], BaseFunctors<a>[g]>,
  then:<h extends keyof BaseFunctors<{}>>(g:Nat<g,h>) => Nat<f, h>
}

const Nat = <f extends keyof BaseFunctors<{}>, g extends keyof BaseFunctors<{}>>() => <a>(actual:<a>() => Exp<BaseFunctors<a>[f], BaseFunctors<a>[g]>) : Nat<f,g> => ({
  actual,
  then:function<h extends keyof BaseFunctors<{}>>(this:Nat<f,g>, g:Nat<g,h>) : Nat<f, h> {
    return Nat<f,h>()(() => this.actual().then(g.actual()) as unknown as any)
  }
})

type MonadUnit<m extends keyof BaseFunctors<{}>, a> = Nat<"Id", m>
type MonadJoin<m extends keyof BaseFunctors<{}>, a> = Nat<Then<m,m>, m>

// Monads = subset of keyof BaseFunctor
// MonadInstance = { [m in Monads] : { unit:MonadUnit<m>, join:MonadJoin<m> } }