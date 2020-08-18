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

type ApplyManyRes<l, a> =
  l extends keyof BaseFunctors<a> ? { res:BaseFunctors<a>[l] }
  : l extends [infer f, ...infer fs] ? 
    f extends keyof BaseFunctors<a> ? { res:ApplyManyRes<fs, BaseFunctors<a>[f]> }
  : never
  : { res:a }

type unboxRes<x> = 
  x extends { res: { res: { res: { res: { res: { res: never }}}}}} ? never :
  x extends { res: { res: { res: { res: { res: never }}}}} ? never :
  x extends { res: { res: { res: { res: never }}}} ? never :
  x extends { res: { res: { res: never }}} ? never :
  x extends { res: { res: never }} ? never :
  x extends { res: never } ? never :
  x extends { res: { res: { res: { res: { res: { res: infer a }}}}}} ? a :
  x extends { res: { res: { res: { res: { res: infer a }}}}} ? a :
  x extends { res: { res: { res: { res: infer a }}}} ? a :
  x extends { res: { res: { res: infer a }}} ? a :
  x extends { res: { res: infer a }} ? a :
  x extends { res: infer a } ? a :
  never

type ComposedFunctor<l,a> = unboxRes<ApplyManyRes<l,a>>

type Then<Fs, Us> =
  Fs extends [infer f, ...infer fs] ? 
    Us extends [infer u, ...infer us] ? 
      [...Fs, ...Us]
    : [...Fs, Us]
  : Us extends [infer u, ...infer us] ? 
    [Fs, ...Us]
  : [Fs, Us]


type FunctorMap<f, a, b> = (_:Exp<a,b>) => Exp<ComposedFunctor<f, a>, ComposedFunctor<f, b>>

interface FMap<f> {
  <a,b>(_:Exp<a,b>) : Exp<ComposedFunctor<f, a>, ComposedFunctor<f, b>>,
  fmap:<a,b>(_:Exp<a,b>) => Exp<ComposedFunctor<f, a>, ComposedFunctor<f, b>>,
  then:<g>(gmap:FMap<g>) => FMap<Then<f,g>>
  after:<g>(gmap:FMap<g>) => FMap<Then<g,f>>
}

const FMap = <f>() => <a,b>(fmap:<a,b>(f:Exp<a,b>) => Exp<ComposedFunctor<f, a>, ComposedFunctor<f, b>>) : FMap<f> => {
  const f_FMap = fmap as FMap<f>
  f_FMap.fmap = fmap
  f_FMap.then = function<g>(gmap:FMap<g>) : FMap<Then<f,g>> {
      return FMap<Then<f,g>>()((f) => gmap.fmap(this.fmap(f)) as unknown as any)
    },
  f_FMap.after=function<g>(gmap:FMap<g>) : FMap<Then<g,f>> {
      return FMap<Then<g,f>>()((f) => this.fmap(gmap.fmap(f)) as unknown as any)
    }
  return f_FMap
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

const fmap = <f extends keyof BaseFunctorMaps<any,any>>(functor:f) : FMap<f> => 
  FMap<f>()(<a,b>(f:Exp<a,b>) => BaseFunctorMaps<any,any>()[functor](f) as Exp<ComposedFunctor<f, a>, ComposedFunctor<f, b>>)

const f1 = fmap("Array")<number,boolean>(Exp(x => x % 2 == 0))
const f2 = fmap("Array").after(fmap("Array")).after(fmap("Array"))<number,boolean>(Exp(x => x % 2 == 0))

interface Nat<f, g> {
  actual:<a>() => Exp<ComposedFunctor<f, a>, ComposedFunctor<g, a>>,
  then:<h>(g:Nat<g,h>) => Nat<f, h>
}

// const Nat = <f extends keyof BaseFunctors<{}>, g extends keyof BaseFunctors<{}>>() => <a>(actual:<a>() => Exp<BaseFunctors<a>[f], BaseFunctors<a>[g]>) : Nat<f,g> => ({
//   actual,
//   then:function<h extends keyof BaseFunctors<{}>>(this:Nat<f,g>, g:Nat<g,h>) : Nat<f, h> {
//     return Nat<f,h>()(() => this.actual().then(g.actual()) as unknown as any)
//   }
// })

type MonadUnit<m extends keyof BaseMonads<{}>, a> = Nat<"Id", m>
type MonadJoin<m extends keyof BaseMonads<{}>, a> = Nat<Then<m,m>, m>

type BaseMonads<a> = Pick<BaseFunctors<a>, "Option" | "List">
type Monad<a> = { [m in keyof BaseMonads<a>] : { unit:MonadUnit<m,a>, join:MonadJoin<m,a> } }


const some = <a>(x:a) : Option<a> => ({ kind:"some", value:x })
const none = <a>() : Option<a> => ({ kind:"none" })
const input = some([[some(1),some(2),some(3),none<number>(),some(4)],[none<number>(),some(5)]])
const f3 = fmap("Option").after(fmap("Array")).after(fmap("Array")).after(fmap("Option"))<number,boolean>(Exp(x => x % 2 == 0))
const test = f3(input)

console.log("Hi!")

type T = Monad<number>["Option"]
const f:T = null!
