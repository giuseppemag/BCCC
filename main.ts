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

  type Name = string
  type Val = { v:Unit, k:"u" } | { v:string, k:"s" } | { v:number, k:"n" } | { v:Bool, k:"b" } | { v:Scope, k:"obj" } | { v:Prod<Expr<Val>, Array<Name>>, k:"lambda" }
  interface Scope extends Immutable.Map<Name, Val> {}
  let empty_scope = Immutable.Map<Name, Val>()
  let unt : Val = ({ v:apply(unit(),{}), k:"u" })
  let str : (_:string) => Val = v => ({ v:v, k:"s" })
  let int : (_:number) => Val = v => ({ v:v, k:"n" })
  let bool : (_:boolean) => Val = v => ({ v:v, k:"b" })
  let unit_expr = () => mk_expr(Co.unit<Mem,Err,Val>(unt))
  let int_expr = (n:number) => mk_expr(Co.unit<Mem,Err,Val>(int(n)))
  interface Err extends String { }
  interface Mem { globals:Scope, stack:Immutable.Map<number, Scope> }
  let load: Fun<Prod<string, Mem>, Val> = fun(x =>
    !x.snd.stack.isEmpty() && x.snd.stack.get(x.snd.stack.count()-1).has(x.fst) ?
      x.snd.stack.get(x.snd.stack.count()-1).get(x.fst)
    :
      x.snd.globals.get(x.fst))
  let store: Fun<Prod<Prod<string, Val>, Mem>, Mem> = fun(x =>
    !x.snd.stack.isEmpty() ?
      ({...x.snd, stack:x.snd.stack.set(x.snd.stack.count() - 1, x.snd.stack.get(x.snd.stack.count() - 1).set(x.fst.fst, x.fst.snd)) })
    :
      ({...x.snd, globals:x.snd.globals.set(x.fst.fst, x.fst.snd) }))
  let push_scope: Fun<Mem, Mem> = fun(x => ({...x, stack:x.stack.set(x.stack.count(), empty_scope)}))
  let pop_scope: Fun<Mem, Mem> = fun(x => ({...x, stack:x.stack.remove(x.stack.count()-1)}))

  interface Expr<A> extends Coroutine<Mem, Err, A> {
    semicolon: (_: Stmt) => Stmt
    as_coroutine: () => Coroutine<Mem, Err, A>
  }
  let mk_expr = function<A>(s: Coroutine<Mem, Err, A>): Expr<A> {
    return {
      ...s,
      semicolon: function (this: Expr<A>, k: Stmt) { return mk_stmt(this.then(_ => k)) },
      as_coroutine: function (this: Expr<A>) { return this }
    }
  }
  let mk_stmt = function(s: Coroutine<Mem, Err, Unit>): Stmt {
    return {
      ...s,
      semicolon: function (this: Stmt, k: Stmt) { return mk_stmt(this.then(_ => k)) },
      as_coroutine: function (this: Stmt) { return this }
    }
  }
  interface Stmt extends Expr<Unit> {}

  let empty_memory = { globals:empty_scope, stack:Immutable.Map<number, Scope>() }

  let done: Stmt = mk_stmt(apply(fun<Unit, Coroutine<Mem, Err, Unit>>(Co.unit), {}))
  let dbg: Stmt = mk_stmt(Co.suspend())
  let set_v = function (v: string, val: Val): Stmt {
    let store_co = store.then(unit().times(id<Mem>()).then(Co.value<Mem, Err, Unit>().then(Co.result<Mem, Err, Unit>().then(Co.no_error<Mem, Err, Unit>()))))
    let f = ((constant<Mem, string>(v).times(constant<Mem, Val>(val))).times(id<Mem>())).then(store_co)
    return mk_stmt(mk_coroutine(f))
  }
  let get_v = function (v: string): Expr<Val> {
    let f = (constant<Mem, string>(v).times(id<Mem>()).then(load)).times(id<Mem>())
    return mk_expr(mk_coroutine(Co.no_error<Mem, Err, Val>().after(Co.result<Mem, Err, Val>().after(Co.value<Mem, Err, Val>().after(f)))))
  }

  let if_then_else = function<c>(f:Fun<Unit,Expr<c>>, g:Fun<Unit,Expr<c>>) : Fun<Bool, Expr<c>> {
    return bool_to_boolcat.times(unit()).then(apply_pair()).then(g.plus(f))
  }
  let while_do = function (p: Expr<Bool>, k: Stmt): Stmt {
    let h:Fun<Bool, Expr<Unit>> = if_then_else(fun(_ => k.semicolon(while_do(p, k))), fun(_ => done))
    return mk_stmt(p.then(defun(h)))
  }

  let call_lambda = function(body:Expr<Val>, args:Array<Prod<Name,Expr<Val>>>) : Expr<Val> {
    let set_args = args.reduce<Stmt>((sets, arg_expr) =>
      mk_stmt(arg_expr.snd.then(arg_v => set_v(arg_expr.fst, arg_v).as_coroutine())).semicolon(sets),
      done)
    let init = mk_stmt(mk_coroutine(push_scope.then(unit<Mem>().times(id<Mem>())).then(Co.value<Mem, Err, Unit>().then(Co.result<Mem, Err, Unit>().then(Co.no_error<Mem, Err, Unit>())))))
    let cleanup = mk_coroutine(pop_scope.then(unit<Mem>().times(id<Mem>())).then(Co.value<Mem, Err, Unit>().then(Co.result<Mem, Err, Unit>().then(Co.no_error<Mem, Err, Unit>()))))
    return mk_expr(init.then(_ =>
           set_args.then(_ =>
           body.then(res =>
           cleanup.then(_ =>
           Co.unit(res))))))
  }

  let run_to_end = <S,E,A>() : CCC.Fun<Prod<Coroutine<S,E,A>, S>, CCC.Sum<E,CCC.Prod<A,S>>> => {
      let f : CCC.Fun<Prod<Coroutine<S,E,A>, S>, CCC.Sum<E,CCC.Prod<A,S>>> =
          CCC.fun(p => run_to_end<S,E,A>().f(p))
      return (Co.run<S,E,A>().map_times(fun<S,S>(s => console.log("Intermediate step:", JSON.stringify(s)) ||
                s))).then(CCC.apply_pair<S, Co.CoPreRes<S,E,A>>()).then(
                CCC.inl<E,CCC.Prod<A,S>>().plus(
                  f.plus(CCC.inr<E,CCC.Prod<A,S>>())))
  }

export let test_imp = function () {
    let loop_test =
      set_v("s", str("")).semicolon(
      set_v("n", int(10)).semicolon(
      while_do(mk_expr(get_v("n").then(n => Co.unit(n.v > 0))),
        mk_stmt(get_v("n").then(n => n.k == "n" ? set_v("n", int(n.v - 1)) : done)).semicolon(
        mk_stmt(get_v("s").then(s => s.k == "s" ? set_v("s", str(s.v + "*")) : done)).semicolon(
        mk_stmt(get_v("n").then(n => n.k == "n" && n.v % 5 == 0 ? dbg : done))))
      )))

    let scope_test =
      set_v("n", int(10)).semicolon(
      mk_stmt(call_lambda(
        mk_expr(dbg.then(_ => int_expr(1))),
        [{ fst:"n", snd:int_expr(5)}]).then(res =>
      console.log("Function returned with res", res) || dbg
      )))

    let p = scope_test

    let res = apply((constant<Unit,Stmt>(p).times(constant<Unit,Mem>(empty_memory))).then(run_to_end()), {})
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
