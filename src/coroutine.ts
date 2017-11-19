import {fun, Fun, Prod, Sum, apply, apply_pair, curry, id, inl, inr, constant, fst, snd, swap_prod} from "./ccc"
import * as CCC from "./ccc"
import * as State from "./state"

export type CoRet<S,E,A> = CCC.Prod<A,S>
export type CoRes<S,E,A> = CCC.Sum<CoCont<S,E,A>, CoRet<S,E,A>>
export type CoCont<S,E,A> = CCC.Prod<Coroutine <S,E,A>, S>
export type CoPreRes<S,E,A> = CCC.Sum<E, CoRes<S,E,A>>
export type Co<S,E,A> = CCC.Fun<S, CoPreRes<S,E,A>>

export let error = function<S,E,A>() : CCC.Fun<E,CoPreRes<S,E,A>> { return inl<E, CoRes<S,E,A>>() }
export let no_error = function<S,E,A>() : CCC.Fun<CoRes<S,E,A>,CoPreRes<S,E,A>> { return inr<E, CoRes<S,E,A>>() }
export let continuation = function<S,E,A>() : CCC.Fun<CoCont<S,E,A>,CoRes<S,E,A>> { return inl<CoCont<S,E,A>, CoRet<S,E,A>>() }
export let result = function<S,E,A>() : CCC.Fun<CoRet<S,E,A>,CoRes<S,E,A>> { return inr<CoCont<S,E,A>, CoRet<S,E,A>>() }
export let value = function<S,E,A>() : CCC.Fun<Prod<A,S>,CoRet<S,E,A>> { return CCC.id<CoRet<S,E,A>>() }

export interface Coroutine <S,E,A> {
  run: Co<S,E,A>,
  then: <B>(k: (_: A) => Coroutine<S,E,B>) => Coroutine<S,E,B>;
  ignore: () => Coroutine<S,E,CCC.Unit>;
  ignore_with: <B>(x:B) => Coroutine<S,E,B>;
  map: <B>(f: CCC.Fun<A,B>) => Coroutine<S,E,B>
}

export let mk_coroutine = function<S,E,A>(run:Co<S,E,A>) : Coroutine<S,E,A> {
  return ({
    run: run,
    then: function<A,B>(this:Coroutine<S,E,A>, k:(_:A)=>Coroutine<S,E,B>) : Coroutine<S,E,B> {
      let f = curry(snd<Coroutine<S,E,A>,A>().then(fun(k)))
      let g = id<Coroutine<S,E,A>>().times(f)
      let h = g.then(map_fun()).then(join_fun())
      return CCC.apply(h, this)
    },
    ignore: function(this:Coroutine<S,E,A>) : Coroutine<S,E,CCC.Unit> {
      return this.ignore_with<CCC.Unit>(CCC.unit().f(null))
    },
    ignore_with: function<B>(this:Coroutine<S,E,A>, y:B) : Coroutine<S,E,B> {
      let f = curry(snd<Coroutine<S,E,A>,A>().then(constant<A,B>(y)))
      let g = id<Coroutine<S,E,A>>().times(f)
      let h = g.then(map_fun())
      return CCC.apply(h, this)
    },
    map: function<B>(this:Coroutine<S,E,A>, f: CCC.Fun<A,B>) : Coroutine<S,E,B> {
      return mk_coroutine<S,E,B>(
        CCC.id<E>().map_plus(
          CCC.apply(curry(map_fun<S,E,A,B>().after(CCC.swap_prod())), f).map_times(CCC.id<S>()).map_plus(
            f.map_times(CCC.id<S>())
          )).after(this.run))
    }
  })
}

let map_fun = function<s,e,a,b>() : Fun<Prod<Coroutine<s,e,a>, Fun<a,b>>, Coroutine<s,e,b>> { return fun(p => p.fst.map(p.snd)) }

export let from_state = function<s,e,a>(p:State.State<s,a>) : Coroutine<s,e,a> {
  return mk_coroutine(p.run.then(result<s,e,a>().then(no_error<s,e,a>())))
}

export let co_run = function<s,e,a>() : CCC.Fun<Coroutine<s,e,a>, Co<s,e,a>> { return fun(p => p.run) }

let join_fun = function<S,E,A>() { return fun<Coroutine<S,E,Coroutine<S,E,A>>, Coroutine<S,E,A>>(c => co_join<S,E,A>(c)) }

export let co_join = function<S,E,A>(pp:Coroutine<S,E,Coroutine<S,E,A>>) : Coroutine<S,E,A> {
  let f : Fun<CoPreRes<S,E,Coroutine<S,E,A>>,CoPreRes<S,E,A>> = error<S,E,A>().plus(
    fst<Coroutine<S,E,Coroutine<S,E,A>>,S>().then(join_fun()).times(snd<Coroutine<S,E,Coroutine<S,E,A>>,S>()).then(
        continuation<S,E,A>().then(
        no_error<S,E,A>())).plus(
     fun<CoRet<S,E,Coroutine<S,E,A>>, CoPreRes<S,E,A>>(prv => CCC.apply(
        prv.fst.run.then(
          error<S,E,A>().plus(
            no_error<S,E,A>().after(continuation<S,E,A>()).plus(
            no_error<S,E,A>().after(result<S,E,A>())),
          )),
        prv.snd)
    ))
  )
  let g = apply(curry(co_run<S,E,Coroutine<S,E,A>>().map_times(id<S>()).then(apply_pair()).then(f)), pp)
  return mk_coroutine<S,E,A>(g)
}

export let co_unit = function<S,E,A>(x:A) : Coroutine<S,E,A> { return mk_coroutine<S,E,A>(
  no_error<S,E,A>().after(result<S,E,A>()).after(constant<S,A>(x).times(id<S>()))) }

let unit_fun = function<S,E,A>() : CCC.Fun<A,Coroutine<S,E,A>> { return CCC.fun(x => co_unit<S,E,A>(x)) }

export let suspend = function<S,E>() : Coroutine<S,E,CCC.Unit> {
  return mk_coroutine<S,E,CCC.Unit>(
    no_error<S,E,CCC.Unit>().after(continuation<S,E,CCC.Unit>().after(unit_fun<S, E, CCC.Unit>().after(CCC.unit<S>().times(id<S>())).times(id<S>())))) }

export type CoRef<s,e,a> = { get:Coroutine<s,e,a>, set:(_:a)=>Coroutine<s,e,CCC.Unit> }

// export let incr : <s,e>(_:CoRef<s, e, number>) => Coroutine<s,e,number> = x =>
//   x.get.then(x_v =>
//   x.set(x_v + 1).then(_ =>
//   x.get))
