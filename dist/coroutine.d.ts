import { Fun, Prod, Sum } from "./ccc";
import * as CCC from "./ccc";
import * as State from "./state";
export declare type CoRet<S, E, A> = CCC.Prod<A, S>;
export declare type CoRes<S, E, A> = CCC.Sum<CoCont<S, E, A>, CoRet<S, E, A>>;
export declare type CoCont<S, E, A> = CCC.Prod<Coroutine<S, E, A>, S>;
export declare type CoPreRes<S, E, A> = CCC.Sum<E, CoRes<S, E, A>>;
export declare type Co<S, E, A> = CCC.Fun<S, CoPreRes<S, E, A>>;
export declare let error: <S, E, A>() => Fun<E, Sum<E, Sum<Prod<Coroutine<S, E, A>, S>, Prod<A, S>>>>;
export declare let no_error: <S, E, A>() => Fun<Sum<Prod<Coroutine<S, E, A>, S>, Prod<A, S>>, Sum<E, Sum<Prod<Coroutine<S, E, A>, S>, Prod<A, S>>>>;
export declare let continuation: <S, E, A>() => Fun<Prod<Coroutine<S, E, A>, S>, Sum<Prod<Coroutine<S, E, A>, S>, Prod<A, S>>>;
export declare let result: <S, E, A>() => Fun<Prod<A, S>, Sum<Prod<Coroutine<S, E, A>, S>, Prod<A, S>>>;
export declare let value: <S, E, A>() => Fun<Prod<A, S>, Prod<A, S>>;
export interface Coroutine<S, E, A> {
    run: Co<S, E, A>;
    then: <B>(k: (_: A) => Coroutine<S, E, B>) => Coroutine<S, E, B>;
    ignore: () => Coroutine<S, E, CCC.Unit>;
    ignore_with: <B>(x: B) => Coroutine<S, E, B>;
    map: <B>(f: CCC.Fun<A, B>) => Coroutine<S, E, B>;
}
export declare let mk_coroutine: <S, E, A>(run: Fun<S, Sum<E, Sum<Prod<Coroutine<S, E, A>, S>, Prod<A, S>>>>) => Coroutine<S, E, A>;
export declare let from_state: <s, e, a>(p: State.State<s, a>) => Coroutine<s, e, a>;
export declare let co_run: <s, e, a>() => Fun<Coroutine<s, e, a>, Fun<s, Sum<e, Sum<Prod<Coroutine<s, e, a>, s>, Prod<a, s>>>>>;
export declare let co_join: <S, E, A>(pp: Coroutine<S, E, Coroutine<S, E, A>>) => Coroutine<S, E, A>;
export declare let co_unit: <S, E, A>(x: A) => Coroutine<S, E, A>;
export declare let suspend: <S, E>() => Coroutine<S, E, CCC.Unit>;
export declare type CoRef<s, e, a> = {
    get: Coroutine<s, e, a>;
    set: (_: a) => Coroutine<s, e, CCC.Unit>;
};
