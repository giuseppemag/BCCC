import { List } from "immutable"

interface Fun<a,b> {
  (a:a) : b,
  then:<c>(g:Fun<b,c>) => Fun<a,c>
}

type Exp<b,a> = Fun<a,b>

const Fun = <a,b>(f:(a:a) => b) : Fun<a,b> => {
  const f_exp = f as Fun<a,b>
  f_exp.then = function<c>(this:Fun<a,b>, g:Fun<b,c>) : Fun<a,c> {
    return Fun(a => g(this(a)))
  }
  return f_exp
}

const id = <a>() : Fun<a,a> => Fun(a => a)

type Id<a> = a
type Option<a> = { kind:"some", value:a } | { kind:"none" }
interface Pair<a,b> { fst:a, snd:b }
type Union<a,b> = { kind:"left", value:a } | { kind:"right", value:b }

interface BaseFunctors<a> {
  Id: Id<a>
  Array: Array<a>
  List : List<a>
  Option: Option<a>
}

interface BaseBiFunctors<a, b> {
  Pair: Pair<a,b>
  Union: Union<a,b>
}

type FlipFunctor<f> = { swap:f }

type ApplyFunctorArg<f,x> = 
  f extends keyof BaseFunctors<x> ? BaseFunctors<x>[f]
  : f extends keyof BaseBiFunctors<x,never> ? [f, 1, x]
    : f extends FlipFunctor<infer F> ?
      F extends keyof BaseBiFunctors<x,never> ? [f, 1, x]
    : never
  : f extends [FlipFunctor<infer F>, 1, infer a1] ? 
    F extends keyof BaseBiFunctors<x,a1> ? BaseBiFunctors<x,a1>[F] : never
  : f extends [infer F, 1, infer a1] ? 
    F extends keyof BaseBiFunctors<a1,x> ? BaseBiFunctors<a1,x>[F] : never
  : never

type ApplyManyRes<l, a> =
  l extends [infer f] ? { res:ApplyFunctorArg<f, a> }
  : l extends [infer f, ...infer fs] ? { res:ApplyManyRes<fs, ApplyFunctorArg<f, a>> }
  : { res:ApplyFunctorArg<l, a> }

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

type T1 = ComposedFunctor<"List", number>
type T2 = ComposedFunctor<["Option", "List", "Array"], number>
type T3 = ComposedFunctor<["Option", ApplyFunctorArg<"Pair", boolean>, "List"], number>
// type T3 = List<Pair<boolean, Option<number>>>
type T4 = ComposedFunctor<["Option", ApplyFunctorArg<FlipFunctor<"Union">, string>, ApplyFunctorArg<"Pair", boolean>, "List"], number>
// type T4 = List<Pair<boolean, Union<string, Option<number>>>>
type T5 = ApplyFunctorArg<ApplyFunctorArg<"Pair", boolean>, number>


type FThen<Fs, Us> =
  Fs extends [infer f, ...infer fs] ? 
    Us extends [infer u, ...infer us] ? 
      [...Fs, ...Us]
    : [...Fs, Us]
  : Us extends [infer u, ...infer us] ? 
    [Fs, ...Us]
  : [Fs, Us]

type FAfter<Fs, Us> = FThen<Us, Fs>


type FunctorMap<f, a, b> = (_:Fun<a,b>) => Fun<ComposedFunctor<f, a>, ComposedFunctor<f, b>>

interface FMap<f> {
  <a,b>(_:Fun<a,b>) : Fun<ComposedFunctor<f, a>, ComposedFunctor<f, b>>,
  fmap:<a,b>(_:Fun<a,b>) => Fun<ComposedFunctor<f, a>, ComposedFunctor<f, b>>,
  then:<g>(gmap:FMap<g>) => FMap<FThen<f,g>>
  after:<g>(gmap:FMap<g>) => FMap<FThen<g,f>>
}

const FMap = <f>() => <a,b>(fmap:<a,b>(f:Fun<a,b>) => Fun<ComposedFunctor<f, a>, ComposedFunctor<f, b>>) : FMap<f> => {
  const f_FMap = fmap as FMap<f>
  f_FMap.fmap = fmap
  f_FMap.then = function<g>(gmap:FMap<g>) : FMap<FThen<f,g>> {
      return FMap<FThen<f,g>>()((f) => gmap.fmap(this.fmap(f)) as unknown as any)
    },
  f_FMap.after=function<g>(gmap:FMap<g>) : FMap<FThen<g,f>> {
      return FMap<FThen<g,f>>()((f) => this.fmap(gmap.fmap(f)) as unknown as any)
    }
  return f_FMap
}


type BaseFunctorMap<f extends keyof BaseFunctors<{}>, a, b> = Fun<Fun<a,b>, Fun<BaseFunctors<a>[f], BaseFunctors<b>[f]>>

type BaseFunctorMaps<a, b> = {
  [f in keyof BaseFunctors<{}>]:BaseFunctorMap<f, a, b>
}

const BaseFunctorMaps = <a,b>() : BaseFunctorMaps<a, b> => ({
  Id: id(),
  Array: Fun(f => Fun(as => as.map(f))),
  List : Fun(f => Fun(as => as.map(a => f(a!)).toList())),
  Option: Fun(f => Fun(oa => oa.kind == "none" ? ({ kind:"none"}) : ({ kind:"some", value:f(oa.value) }))),
})

const fmap = <f extends keyof BaseFunctorMaps<any,any>>(functor:f) : FMap<f> => 
  FMap<f>()(<a,b>(f:Fun<a,b>) => BaseFunctorMaps<any,any>()[functor](f) as Fun<ComposedFunctor<f, a>, ComposedFunctor<f, b>>)

const f1 = fmap("List").after(fmap("Option"))<number,boolean>(Fun(x => x % 2 == 0))
const f2 = fmap("Option").after(fmap("List")).after(fmap("List"))<number,boolean>(Fun(x => x % 2 == 0))

interface Nat<f, g> {
  actual:<a>() => Fun<ComposedFunctor<f, a>, ComposedFunctor<g, a>>,
  then:<h>(g:Nat<g,h>) => Nat<f, h>
  after:<h>(g:Nat<h,f>) => Nat<h, g>
  above:<h>(hmap:FMap<h>) => Nat<FAfter<h,f>, FAfter<h,g>>
  below:<h>(hmap:FMap<h>) => Nat<FAfter<f,h>, FAfter<g,h>>
}

const Nat = <f, g>() => (actual:<a>() => Fun<ComposedFunctor<f, a>, ComposedFunctor<g, a>>) : Nat<f,g> => ({
  actual,
  then:function<h>(g:Nat<g,h>) : Nat<f, h> {
    return Nat<f,h>()(<a>() => this.actual<a>().then(g.actual<a>()))
  },
  after:function<h>(g:Nat<h,f>) : Nat<h, g> {
    return Nat<h,g>()(<a>() => g.actual<a>().then(this.actual<a>()))
  },
  above:function<h>(hmap:FMap<h>) : Nat<FAfter<h,f>, FAfter<h,g>> {
    return Nat<FAfter<h,f>, FAfter<h,g>>()(<a>() => hmap<ComposedFunctor<f, a>, ComposedFunctor<g, a>>(this.actual<a>()) as unknown as any)
  },
  below:function<h>(hmap:FMap<h>) : Nat<FAfter<f,h>, FAfter<g,h>> {
    return Nat<FAfter<f,h>, FAfter<g,h>>()(<a>() => this.actual<ComposedFunctor<h,a>>() as unknown as any)
  }
})

type MonadUnit<m extends keyof BaseMonads<{}>, a> = Nat<"Id", m>
type MonadJoin<m extends keyof BaseMonads<{}>, a> = Nat<FThen<m,m>, m>

type BaseMonads<a> = Pick<BaseFunctors<a>, "Option" | "List">
type Monad<a> = { [m in keyof BaseMonads<a>] : { unit:MonadUnit<m,a>, join:MonadJoin<m,a> } }

// const V2 = V1<number>()







const some = <a>(value:a) : Option<a> => ({ kind:"some", value }) 
const none = <a>() : Option<a> => ({ kind:"none" })

const input = some([[some(1),some(2),some(3),none<number>(),some(4)],[none<number>(),some(5)]])
const f3 = fmap("Option").after(fmap("Array")).after(fmap("Array")).after(fmap("Option"))<number,boolean>(Fun(x => x % 2 == 0))

const head:Nat<"List","Option"> = Nat()(<a>() => Fun<List<a>, Option<a>>((l:List<a>) : Option<a> => l.isEmpty() ? none<a>() : some<a>(l.get(0))) as unknown as any)
const o2l:Nat<"Option","List"> = Nat()(<a>() => Fun<Option<a>, List<a>>((o:Option<a>) : List<a> => o.kind == "none" ? List() : List([o.value])) as unknown as any)

const input2:List<number> = List([1,2,3,4,5])

const out1 = head.actual<number>()(input2)

const out2 = head.then(o2l).actual<number>()(input2)

const ttt = head.actual<number>()
const whoah = head.above(fmap("Array")).above(fmap("Option")).actual<number>()
const haohw = head.below(fmap("Array")).above(fmap("Array")).actual<number>()

const out3 = whoah(some([List([1,2]), List([3]), List([4,5,6]), List()]))
const out4 = haohw([List([[1],[2]]), List([[3]]), List(), List([[4,5],[6]])])


const test = f3(input)

console.log("Hi!")

const f = (null! as Monad<number>["List"]["join"]).above(fmap("Option")).actual<number>()

type State<s> = <a>() => Fun<s,Pair<a,s>>
