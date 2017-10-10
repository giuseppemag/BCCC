import * as Immutable from 'immutable'
import * as CCC from './ccc'

export type Option<A> = CCC.Sum<A, CCC.Unit>
export let none = <A>() : Option<A> => CCC.inr(CCC.unit(null))
export let some = <A>(x:A) : Option<A> => CCC.inl(x)

export let map = <A,B>(p:Option<A>, f:(_:A)=>B) : Option<B> =>
  CCC.plus<Option<B>, A, CCC.Unit>(x => some<B>(f(x)), _ => none<B>())(p)

export let to_array = <A>(p:Option<A>) : Array<A> =>
  CCC.plus<Array<A>, A, CCC.Unit>(x => [x], _ => [])(p)

export let to_list = <A>(p:Option<A>) : Immutable.List<A> =>
  Immutable.List<A>(to_array(p))

export let merge = <S,T>(f:(_:S) => Option<T>, g:(_:S) => Option<T>) : ((_:S) => Option<T>) =>
  // s => {
  //   let x = f(s)
  //   if (x.kind == "right") return g(s)
  //   else return x
  // }
  // s => CCC.times_into<Option<T>, Option<T>, Option<T>>(
  //   (p:Option<T>) => (q:Option<T>) =>
  //     CCC.plus((x:T) => p, _ => q)
  //     (p))
  //     (CCC.times(f, g)(s))
  s => CCC.apply(CCC.fun(CCC.plus((x:T) => some<T>(x), _ => g(s))).after(CCC.fun(f)), s)
