import { Fun, Prod } from "./ccc";
import * as CCC from "./ccc";
export interface St<S, A> extends CCC.Fun<S, CCC.Prod<A, S>> {
}
export declare type State<S, A> = {
    run: St<S, A>;
    then: <B>(k: (_: A) => State<S, B>) => State<S, B>;
    ignore: () => State<S, CCC.Unit>;
    ignore_with: <B>(x: B) => State<S, B>;
    map: <B>(f: CCC.Fun<A, B>) => State<S, B>;
};
export declare let mk_state: <S, A>(run: Fun<S, Prod<A, S>>) => State<S, A>;
export declare let st_run: <s, a>() => Fun<State<s, a>, St<s, a>>;
export declare let st_join: <S, A>(pp: State<S, State<S, A>>) => State<S, A>;
export declare let st_unit: <S, A>(x: A) => State<S, A>;
export interface StRef<s, a> {
    get: State<s, a>;
    set: (_: a) => State<s, CCC.Unit>;
}
