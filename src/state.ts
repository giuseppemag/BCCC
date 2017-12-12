import {fun, Fun, Prod, apply, curry, id, constant, fst, snd, apply_pair, Unit, unit} from "./ccc"
import * as CCC from "./ccc"
import * as Option from "./option"

export interface St<S,A> extends CCC.Fun<S, CCC.Prod<A,S>> {}
export type State <S,A> = {
  run: St<S,A>,
  then: <B>(k: (_: A) => State <S,B>) => State <S,B>;
  ignore: () => State<S,CCC.Unit>;
  ignore_with: <B>(x:B) => State<S,B>;
  map: <B>(f: CCC.Fun<A,B>) => State <S,B>
}

export let mk_state = function<S,A>(run:CCC.Fun<S, CCC.Prod<A,S>>) : State<S,A> {
  return ({
    run: run,
    then: function<A,B>(this:State<S,A>, k:(_:A)=>State<S,B>) : State<S,B> {
      return st_join(this.map(fun(k)))
    },
    ignore: function(this:State<S,A>) : State<S,CCC.Unit> {
      return this.ignore_with<CCC.Unit>(CCC.unit().f({}))
    },
    ignore_with: function<B>(this:State<S,A>, y:B) : State<S,B> {
      return this.map(constant(y))
    },
    map: function<B>(this:State<S,A>, f: CCC.Fun<A,B>) : State<S,B> {
      return mk_state<S,B>(f.map_times(CCC.id<S>()).after(this.run))
    }
  })
}

export let st_run = function<s,a>() : Fun<State<s,a>, St<s,a>> { return fun(p => p.run) }

export let st_join = function<S,A>(pp:State<S,State<S,A>>) : State<S,A> {
  let g = fst<State<S,A>,S>().then(st_run<S,A>()).times(snd<State<S,A>,S>()).then(apply_pair())
  let h = st_run<S,State<S,A>>().map_times(id<S>()).then(apply_pair()).then(g)
  return mk_state<S,A>(apply(curry(h), pp))
}

export let st_get_state = function<S>() : State<S,S> { return mk_state<S,S>(id<S>().times(id<S>())) }
export let st_set_state = function<S>(s:S) : State<S,Unit> { return mk_state<S,Unit>(unit<S>().times(constant<S,S>(s))) }

export let st_unit = function<S,A>(x:A) : State<S,A> { return mk_state<S,A>(constant<S,A>(x).times(id<S>())) }

export interface StRef<s,a> { get:State<s,a>, set:(_:a)=>State<s,CCC.Unit> }

// export let incr : <S>(_:StRef<S, number>) => State<S,number> = x =>
//   x.get.then(x_v =>
//   x.set(x_v + 1).then(_ =>
//   x.get))
