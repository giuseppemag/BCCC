import * as Immutable from 'immutable'
import * as CCC from './ccc'

export type Option<A> = CCC.Sum<A, CCC.Unit>
// export let none = <A>() : Option<A> => CCC.apply(CCC.unit().then(CCC.inr<A,CCC.Unit>()), null)
// export let some = <A>(x:A) : Option<A> => CCC.apply(CCC.inl<A,CCC.Unit>(), x)

// export let map = <A,B>(p:Option<A>, f:(_:A)=>B) : Option<B> =>
//   CCC.apply(CCC.fun<A,Option<B>>(x => some<B>(f(x))).plus(CCC.fun<CCC.Unit,Option<B>>(_ => none<B>())), p)

// export let to_array = <A>(p:Option<A>) : Array<A> =>
//   CCC.apply(CCC.fun<A,Array<A>>(x => [x]).plus(CCC.fun<CCC.Unit,Array<A>>(_ => [])), p)

// export let to_list = <A>(p:Option<A>) : Immutable.List<A> =>
//   Immutable.List<A>(to_array(p))

// export let merge = <S,T>(f:(_:S) => Option<T>, g:(_:S) => Option<T>) : ((_:S) => Option<T>) =>
//   s => CCC.apply(CCC.fun(f).then<Option<T>>(CCC.id<T>().map_plus(CCC.fun(_ => g(s)))), s)
