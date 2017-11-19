import * as Immutable from 'immutable';
import * as CCC from './ccc';
export declare type Option<A> = CCC.Sum<A, CCC.Unit>;
export declare let none: <A>() => CCC.Sum<A, CCC.Unit>;
export declare let some: <A>(x: A) => CCC.Sum<A, CCC.Unit>;
export declare let map: <A, B>(p: CCC.Sum<A, CCC.Unit>, f: (_: A) => B) => CCC.Sum<B, CCC.Unit>;
export declare let to_array: <A>(p: CCC.Sum<A, CCC.Unit>) => A[];
export declare let to_list: <A>(p: CCC.Sum<A, CCC.Unit>) => Immutable.List<A>;
export declare let merge: <S, T>(f: (_: S) => CCC.Sum<T, CCC.Unit>, g: (_: S) => CCC.Sum<T, CCC.Unit>) => (_: S) => CCC.Sum<T, CCC.Unit>;
