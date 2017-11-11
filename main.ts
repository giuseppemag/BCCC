import * as Immutable from "immutable"
import { Unit, Fun, Prod, Sum, unit, absurd, fst, snd, defun, fun, inl, inr, apply, apply_pair, id, constant, curry, uncurry, lazy, swap_prod, swap_sum, compose_pair } from "./ccc"
import * as CCC from "./ccc"
import * as St from "./state"
import { mk_state, State } from "./state"
import { mk_coroutine, Coroutine, suspend } from "./coroutine"
import * as Co from "./coroutine"

// interface TwoVars { a:number, b:number }
// let a_get : Fun<TwoVars,number> = fun(tv => tv.a)
// let b_get : Fun<TwoVars,number> = fun(tv => tv.b)
// let a_set : (_:number) => Fun<TwoVars,TwoVars> = n => fun(tv => ({...tv, a:n}))
// let b_set : (_:number) => Fun<TwoVars,TwoVars> = n => fun(tv => ({...tv, b:n}))

// let test_state = () => {
//     let a_ref : St.Ref<TwoVars, number>
//         = { get: mk_state(a_get.times(id<TwoVars>())),
//             set: n => mk_state(CCC.unit<TwoVars>().times(a_set(n))) }

//     // let mk_state_fun = function<s,a>() { return fun<Fun<s,Prod<a,s>>, State<s,a>>(mk_state) }
//     // let a_set_fun : Fun<Prod<number, TwoVars>,TwoVars> = fun((tv:CCC.Prod<number, TwoVars>) => ({...tv.snd, a:tv.fst}))
//     // let g = curry(CCC.unit<Prod<number, TwoVars>>().times(a_set_fun))
//     // let z = apply(mk_state_fun(), CCC.unit<TwoVars>().times(a_set(10)))
//     // let h = id<number>().map_times(z)
//     // let f = (n:number) => mk_state(CCC.unit<TwoVars>().times(a_set(n)))

//     let b_ref : St.Ref<TwoVars, number>
//         = { get: mk_state(b_get.times(id<TwoVars>())),
//             set: n => mk_state(CCC.unit<TwoVars>().times(b_set(n))) }

//     let incr_a = St.incr(a_ref)
//     let incr_b = St.incr(b_ref)

//     let incr_swap = incr_a.then(_ =>
//             incr_b.then(_ =>
//             a_ref.get.then(a_v =>
//             b_ref.get.then(b_v =>
//             b_ref.set(a_v).then(_ =>
//             a_ref.set(b_v).then(_ =>
//             St.unit(a_v + b_v)))))))

//     console.log("State test:", JSON.stringify(CCC.apply(incr_swap.run, {a:0, b:10})))
// }


// let test_coroutine = () => {
//     // let f = Co.no_error<TwoVars,string,number>().after()
//     let a : Co.Ref<TwoVars, string, number>
//         = { get: Co.from_state(mk_state(a_get.times(id<TwoVars>()))),
//             set: n => Co.from_state(mk_state(CCC.unit<TwoVars>().times(a_set(n)))) }

//     let b : Co.Ref<TwoVars, string, number>
//         = { get: Co.from_state(mk_state(b_get.times(id<TwoVars>()))),
//             set: n => Co.from_state(mk_state(CCC.unit<TwoVars>().times(b_set(n)))) }

//     let incr_a = Co.incr(a)
//     let incr_b = Co.incr(b)

//     let incr_swap =
//         incr_a.then(_ =>
//         suspend<TwoVars, string>().then(_ =>
//         incr_b.then(_ =>
//         suspend<TwoVars, string>().then(_ =>
//         a.get.then(a_v =>
//         b.get.then(b_v =>
//         b.set(a_v).then(_ =>
//         suspend<TwoVars, string>().then(_ =>
//         a.set(b_v).then(_ =>
//         Co.unit(a_v + b_v))))))))))

//     let run_to_end = <S,E,A>() : CCC.Fun<Prod<Coroutine<S,E,A>, S>, CCC.Sum<E,CCC.Prod<A,S>>> => {
//         let f : CCC.Fun<Prod<Coroutine<S,E,A>, S>, CCC.Sum<E,CCC.Prod<A,S>>> =
//             CCC.fun(p => run_to_end<S,E,A>().f(p))
//         return (Co.run<S,E,A>().map_times(fun<S,S>(s => console.log("Intermediate step:", JSON.stringify(s)) || s))).then(CCC.apply_pair<S, Co.CoPreRes<S,E,A>>()).then(
//                   CCC.inl<E,CCC.Prod<A,S>>().plus(
//                     f.plus(
//                     CCC.inr<E,CCC.Prod<A,S>>())))
//     }
//     console.log("Coroutine test:",
//         JSON.stringify(
//             CCC.apply(constant<CCC.Unit, Coroutine<TwoVars, string, number>>(incr_swap).times(constant<CCC.Unit, TwoVars>({a:0, b:10})).then(
//                 run_to_end<TwoVars, string, number>()), {})
//         )
//     )
// }

// test_state()
// test_coroutine()

// module ImpLanguageNoCoroutine {
//   type Two = Sum<Unit,Unit>
//   type Bool = Fun<Unit, Two>
//   let False:Bool = unit<Unit>().then(inl<Unit,Unit>())
//   let True:Bool  = unit<Unit>().then(inr<Unit,Unit>())

//   let ignore_as_false : Fun<Unit,Fun<Bool,Bool>> = curry(fst<Unit,Bool>().then(lazy(False)))
//   let ignore_as_true : Fun<Unit,Fun<Bool,Bool>> = curry(fst<Unit,Bool>().then(lazy(True)))
//   let return_second : Fun<Unit,Fun<Bool,Bool>> = curry(snd<Unit,Bool>())

//   let Not:Fun<Bool,Bool> = id<Bool>().times(unit<Bool>().then(lazy(True.plus(False)))).then(compose_pair())

//   let And :Fun<Prod<Bool,Bool>, Bool>
//     = id<Bool>().times(unit<Bool>().then(lazy(ignore_as_false.plus(return_second)))).then(compose_pair()).then(CCC.distribute_exp_prod()).map_times(unit<Bool>().times(id<Bool>())).then(
//       apply_pair()
//     )

//   let Or :Fun<Prod<Bool,Bool>, Bool>
//     = id<Bool>().times(unit<Bool>().then(lazy(return_second.plus(ignore_as_true)))).then(compose_pair()).then(CCC.distribute_exp_prod()).map_times(unit<Bool>().times(id<Bool>())).then(
//       apply_pair()
//     )

//   export let test_imp = () => {
//     let arg = lazy(True).times(lazy(True))
//     let prg = lazy(And)
//     let res:Fun<Unit,Bool> = (prg.times(arg)).then(apply_pair())
//     console.log(res.f({}).f({}).kind == "left" ? "False" : "True")
//   }
// }

// ImpLanguageNoCoroutine.test_imp()

module ImpLanguageWithSuspend {
  let mk_state_fun = function <s, a>() { return fun<Fun<s, Prod<a, s>>, State<s, a>>(mk_state) }

  type Bool = boolean
  interface BoolCat extends Fun<Unit, Sum<Unit,Unit>> {}
  let False:BoolCat = unit<Unit>().then(inl<Unit,Unit>())
  let True:BoolCat  = unit<Unit>().then(inr<Unit,Unit>())
  let bool_to_boolcat : Fun<Bool, BoolCat> = fun(b => b ? True : False)

  type Val = string | number | Bool
  interface Err extends String { }
  interface Mem extends Immutable.Map<string, Val> { }
  interface Scope extends Immutable.Map<string, Co.Ref<Mem,Err,Val>> { }
  let load: Fun<Prod<string, Mem>, Val> = fun(x => x.snd.get(x.fst))
  let store: Fun<Prod<Prod<string, Val>, Mem>, Mem> = fun(x => x.snd.set(x.fst.fst, x.fst.snd))
  interface Stmt extends Coroutine<Mem, Err, Unit> {
    semicolon: (_: Stmt) => Stmt
    as_coroutine: () => Coroutine<Mem, Err, Unit>
  }
  let mk_stmt = function (s: Coroutine<Mem, Err, Unit>): Stmt {
    return {
      ...s,
      semicolon: function (this: Stmt, k: Stmt) { return semicolon(this, k) },
      as_coroutine: function (this: Stmt) { return this }
    }
  }
  interface Expr<A> extends Coroutine<Mem, Err, A> {

  }

  let m0 = Immutable.Map<string, Val>()

  let done: Stmt = mk_stmt(apply(fun<Unit, Coroutine<Mem, Err, Unit>>(Co.unit), {}))
  let dbg: Stmt = mk_stmt(Co.suspend())
  let set_v = function (v: string, val: Val): Stmt {
    let store_co = store.then(unit().times(id<Mem>()).then(Co.value<Mem, Err, Unit>().then(Co.result<Mem, Err, Unit>().then(Co.no_error<Mem, Err, Unit>()))))
    let f = ((constant<Mem, string>(v).times(constant<Mem, Val>(val))).times(id<Mem>())).then(store_co)
    return mk_stmt(mk_coroutine(f))
  }
  let get_v = function (v: string): Expr<Val> {
    let f = (constant<Mem, string>(v).times(id<Mem>()).then(load)).times(id<Mem>())
    return mk_coroutine(Co.no_error<Mem, Err, Val>().after(Co.result<Mem, Err, Val>().after(Co.value<Mem, Err, Val>().after(f))))
  }

  let semicolon = function (p: Stmt, k: Stmt): Stmt {
    return mk_stmt(p.then(_ => k))
  }

  let if_then_else = function<c>(f:Fun<Unit,Expr<c>>, g:Fun<Unit,Expr<c>>) : Fun<Bool, Expr<c>> {
    return bool_to_boolcat.times(unit()).then(apply_pair()).then(g.plus(f))
  }

  let while_do = function (p: Expr<Bool>, k: Stmt): Stmt {
    let g:Stmt = done
    let h:Fun<Bool, Expr<Unit>> = if_then_else(fun(_ => k.semicolon(while_do(p, k))), fun(_ => g))
    let i = p.then(defun(h))
    return mk_stmt(i)
    // return mk_stmt(p.then(c => c ? k.then(_ => while_do(p, k)) : done))
  }

  let run_to_end = <S,E,A>() : CCC.Fun<Prod<Coroutine<S,E,A>, S>, CCC.Sum<E,CCC.Prod<A,S>>> => {
      let f : CCC.Fun<Prod<Coroutine<S,E,A>, S>, CCC.Sum<E,CCC.Prod<A,S>>> =
          CCC.fun(p => run_to_end<S,E,A>().f(p))
      return (Co.run<S,E,A>().map_times(fun<S,S>(s => console.log("Intermediate step:", JSON.stringify(s)) || s))).then(CCC.apply_pair<S, Co.CoPreRes<S,E,A>>()).then(
                CCC.inl<E,CCC.Prod<A,S>>().plus(
                  f.plus(
                  CCC.inr<E,CCC.Prod<A,S>>())))
  }

export let test_imp = function () {
    let p =
      set_v("s", "").semicolon(
      dbg.semicolon(
      set_v("n", 1000).semicolon(
      dbg.semicolon(
      while_do(get_v("n").then(n => Co.unit(n > 0)),
        mk_stmt(get_v("n").then(n => typeof n == "number" ? set_v("n", n - 1) : done)).semicolon(
        mk_stmt(get_v("s").then(s => typeof s == "string" ? set_v("s", s + "*") : done)).semicolon(
        dbg))
      )))))

          //   dbg.semicolon(
      //     set_v("y", 20).semicolon(
      //       done
      //     )
      //   )
      // )

    let res = apply((constant<Unit,Stmt>(p).times(constant<Unit,Mem>(m0))).then(run_to_end()), {})
    console.log(JSON.stringify(res))
  }
}

ImpLanguageWithSuspend.test_imp()

// let incr = CCC.fun<number,number>(x => x + 1)
// let double = CCC.fun<number,number>(x => x * 2)
// console.log(CCC.apply(incr.then(double), 5))
// console.log(CCC.apply(incr.map_times(double), CCC.mk_pair<number,number>(5)(2)))
// console.log(CCC.apply(incr.map_plus(double), CCC.inl<number,number>().f(5)))
// console.log(CCC.apply(incr.plus(double), CCC.inr<number,number>().f(4)))
