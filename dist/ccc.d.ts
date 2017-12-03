export declare let id: <a>() => Fun<a, a>;
export declare let constant: <c, a>(a: a) => Fun<c, a>;
export declare type Zero = never;
export declare let absurd: <a>() => Fun<never, a>;
export interface Unit {
}
export declare let unit: <a>() => Fun<a, Unit>;
export declare type Sum<a, b> = {
    kind: "left";
    value: a;
} | {
    kind: "right";
    value: b;
};
export interface Prod<a, b> {
    fst: a;
    snd: b;
}
export interface Fun<a, b> {
    f: (_: a) => b;
    after: <c>(f: Fun<c, a>) => Fun<c, b>;
    then: <c>(f: Fun<b, c>) => Fun<a, c>;
    plus: <c>(g: Fun<c, b>) => Fun<Sum<a, c>, b>;
    map_plus: <c, d>(g: Fun<c, d>) => Fun<Sum<a, c>, Sum<b, d>>;
    times: <c>(g: Fun<a, c>) => Fun<a, Prod<b, c>>;
    map_times: <c, d>(g: Fun<c, d>) => Fun<Prod<a, c>, Prod<b, d>>;
    map_times_left: <c>() => Fun<Prod<a, c>, Prod<b, c>>;
    map_times_right: <c>() => Fun<Prod<c, a>, Prod<c, b>>;
    map_sum_left: <c>() => Fun<Sum<a, c>, Sum<b, c>>;
    map_sum_right: <c>() => Fun<Sum<c, a>, Sum<c, b>>;
}
export declare let fun: <a, b>(f: (_: a) => b) => Fun<a, b>;
export declare let defun: <a, b>(f: Fun<a, b>) => (_: a) => b;
export declare let fun2: <a, b, c>(f: (x: a, y: b) => c) => Fun<Prod<a, b>, c>;
export declare let fun3: <a, b, c, d>(f: (x: a, y: b, z: c) => d) => Fun<Prod<a, Prod<b, c>>, d>;
export declare let apply: <a, b>(f: Fun<a, b>, x: a) => b;
export declare let apply_pair: <a, b>() => Fun<Prod<Fun<a, b>, a>, b>;
export declare let curry: <a, b, c>(f: Fun<Prod<a, b>, c>) => Fun<a, Fun<b, c>>;
export declare let uncurry: <a, b, c>(f: Fun<a, Fun<b, c>>) => Fun<Prod<a, b>, c>;
export interface Exp<b, a> extends Fun<a, b> {
}
export declare let exp: <a, b>(f: (_: a) => b) => Exp<b, a>;
export declare type Plus<a, b> = Sum<a, b>;
export declare type Times<a, b> = Prod<a, b>;
export declare let fst: <a, b>() => Fun<Prod<a, b>, a>;
export declare let snd: <a, b>() => Fun<Prod<a, b>, b>;
export declare let inl: <a, b>() => Fun<a, Sum<a, b>>;
export declare let inr: <a, b>() => Fun<b, Sum<a, b>>;
export declare let distribute_sum_prod: <a, b, c>() => Fun<Prod<a, Sum<b, c>>, Sum<Prod<a, b>, Prod<a, c>>>;
export declare let distribute_sum_prod_inv: <a, b, c>() => Fun<Sum<Prod<a, b>, Prod<a, c>>, Prod<a, Sum<b, c>>>;
export declare let distribute_exp_sum: <a, b, c>() => Fun<Fun<Sum<a, b>, c>, Prod<Fun<a, c>, Fun<b, c>>>;
export declare let distribute_exp_sum_inv: <a, b, c>() => Fun<Prod<Fun<a, c>, Fun<b, c>>, Fun<Sum<a, b>, c>>;
export declare let distribute_exp_prod: <a, b, c>() => Fun<Fun<a, Fun<b, c>>, Fun<Prod<a, b>, c>>;
export declare let distribute_exp_prod_inv: <a, b, c>() => Fun<Fun<Prod<a, b>, c>, Fun<a, Fun<b, c>>>;
export declare let power_of_zero: <a>() => Fun<Fun<never, a>, Unit>;
export declare let power_of_zero_inv: <a>() => Fun<Unit, Fun<never, a>>;
export declare let swap_exp_args: <a, b, c>() => Fun<Fun<a, Fun<b, c>>, Fun<b, Fun<a, c>>>;
export declare let swap_prod: <a, b>() => Fun<Prod<a, b>, Prod<b, a>>;
export declare let swap_sum: <a, b>() => Fun<Sum<a, b>, Sum<b, a>>;
export declare let map_times_right: <a, b, c>() => Fun<Fun<a, b>, Fun<Prod<c, a>, Prod<c, b>>>;
export declare let map_sum_left: <a, b, c>() => Fun<Fun<a, b>, Fun<Sum<a, c>, Sum<b, c>>>;
export declare let map_sum_right: <a, b, c>() => Fun<Fun<a, b>, Fun<Sum<c, a>, Sum<c, b>>>;
export declare let lazy: <a, b>(x: Fun<a, b>) => Fun<Unit, Fun<a, b>>;
export declare let compose_pair: <a, b, c>() => Fun<Prod<Fun<a, b>, Fun<b, c>>, Fun<a, c>>;
export declare let lazy_value: <a>() => Fun<a, Fun<Unit, a>>;
export declare let eager_value: <a>() => Fun<Fun<Unit, a>, a>;
export declare let product_identity: <a>() => Fun<Prod<a, Unit>, a>;
export declare let product_identity_inv: <a>() => Fun<a, Prod<a, Unit>>;
export declare let sum_identity: <a>() => Fun<Sum<a, never>, a>;
export declare let sum_identity_inv: <a>() => Fun<a, Sum<a, never>>;
export declare let plus_cat: <a, b, c>() => Fun<Prod<Fun<a, c>, Fun<b, c>>, Fun<Sum<a, b>, c>>;
export declare let plus_par_cat: <a, b, c, d>() => Fun<Prod<Fun<a, c>, Fun<b, d>>, Fun<Sum<a, b>, Sum<c, d>>>;
export declare let prod_to_fun: <a>() => Fun<Prod<a, a>, Fun<Sum<Unit, Unit>, a>>;
export declare let prod_from_fun: <a>() => Fun<Fun<Sum<Unit, Unit>, a>, Prod<a, a>>;
