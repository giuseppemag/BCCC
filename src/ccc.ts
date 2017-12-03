export let id = function<a>() : Fun<a,a> { return fun(x => x) }

export let constant = <c,a>(a:a) : Fun<c,a> => fun(x => a)

export type Zero = never
export let absurd = <a>() : Fun<Zero,a> => fun<Zero,a>(_ => { throw "Does not exist." })

export interface Unit {}
export let unit = <a>() : Fun<a,Unit> => fun(x => ({}))

export type Sum<a,b> = { kind:"left", value:a } | { kind:"right", value:b }
let plus = <c,a,b>(f:(_:a) => c, g:(_:b) => c) => (x:Sum<a,b>) => x.kind == "left" ? f(x.value) : g(x.value)
let plus_par = <a,b,c,d>(f:(_:a) => c, g:(_:b) => d) => (x:Sum<a,b>) : Sum<c,d> => x.kind == "left" ? inl<c,d>().f(f(x.value)) : inr<c,d>().f(g(x.value))

export interface Prod<a,b> { fst:a, snd:b }
// export let mk_pair = <a,b>(x:a) : (y:b) => Prod<a,b> => y => ({ fst:x, snd:y })
let times = <c,a,b>(f:(_:c) => a, g:(_:c) => b) => (x:c) : Prod<a,b> => ({ fst:f(x), snd:g(x) })
let times_par = <a,b,c,d>(f:(_:a) => c, g:(_:b) => d) => (x:Prod<a,b>) : Prod<c,d> => ({ fst:f(x.fst), snd:g(x.snd) })

export interface Fun<a,b> {
  f:(_:a) => b
  after:<c>(f:Fun<c,a>) => Fun<c,b>
  then:<c>(f:Fun<b,c>) => Fun<a,c>
  plus:<c>(g:Fun<c,b>) => Fun<Sum<a,c>, b>
  map_plus:<c,d>(g:Fun<c,d>) => Fun<Sum<a,c>, Sum<b,d>>
  times:<c>(g:Fun<a,c>) => Fun<a, Prod<b,c>>
  map_times:<c,d>(g:Fun<c,d>) => Fun<Prod<a,c>, Prod<b,d>>,
  map_times_left:<c>() => Fun<Prod<a,c>, Prod<b,c>>,
  map_times_right:<c>() => Fun<Prod<c,a>, Prod<c,b>>
  map_sum_left:<c>() => Fun<Sum<a,c>, Sum<b,c>>,
  map_sum_right:<c>() => Fun<Sum<c,a>, Sum<c,b>>,
}

export let fun = <a,b>(f:(_:a) => b) : Fun<a,b> => ({
    f:f,
    after: function<c>(this:Fun<a,b>, g:Fun<c,a>) : Fun<c,b> { return fun<c,b>((x) => this.f(g.f(x))) },
    then: function<c>(this:Fun<a,b>, g:Fun<b,c>) : Fun<a,c> { return fun<a,c>((x) => g.f(this.f(x))) },
    plus: function<c>(this:Fun<a,b>, g:Fun<c,b>) : Fun<Sum<a,c>, b> { return fun(plus(this.f, g.f)) },
    map_plus: function<c,d>(this:Fun<a,b>, g:Fun<c,d>) : Fun<Sum<a,c>, Sum<b,d>> { return fun(plus_par(this.f, g.f)) },
    times: function<c>(this:Fun<a,b>, g:Fun<a,c>) : Fun<a, Prod<b,c>> { return fun(times(this.f, g.f)) },
    map_times: function<c,d>(this:Fun<a,b>, g:Fun<c,d>) : Fun<Prod<a,c>, Prod<b,d>> { return fun(times_par(this.f, g.f)) },
    map_times_left: function<c>(this:Fun<a,b>) : Fun<Prod<a,c>, Prod<b,c>> { return apply(map_times_left<a,b,c>(), this) },
    map_times_right: function<c>(this:Fun<a,b>) : Fun<Prod<c,a>, Prod<c,b>> { return apply(map_times_right<a,b,c>(), this) },
    map_sum_left: function<c>(this:Fun<a,b>) : Fun<Sum<a,c>, Sum<b,c>> { return apply(map_sum_left<a,b,c>(), this) },
    map_sum_right: function<c>(this:Fun<a,b>) : Fun<Sum<c,a>, Sum<c,b>> { return apply(map_sum_right<a,b,c>(), this) },
  })
export let defun = <a,b>(f:Fun<a,b>) : ((_:a) => b) => f.f

export let fun2 = <a,b,c>(f:(x:a,y:b) => c) : Fun<Prod<a,b>,c> => fun(ab => f(ab.fst, ab.snd))
export let fun3 = <a,b,c,d>(f:(x:a,y:b,z:c) => d) : Fun<Prod<a,Prod<b,c>>,d> => fun(abc => f(abc.fst, abc.snd.fst, abc.snd.snd))

export let apply = <a,b>(f:Fun<a,b>, x:a) : b => f.f(x)
export let apply_pair = function<a,b>() : Fun<Prod<Fun<a,b>, a>,b> { return fun(p => p.fst.f(p.snd)) }

export let curry = function<a,b,c>(f:Fun<Prod<a,b>,c>) : Fun<a,Fun<b,c>> { return fun(a => fun(b => f.f({ fst:a, snd:b }))) }

export let uncurry = function<a,b,c>(f:Fun<a,Fun<b,c>>) : Fun<Prod<a,b>,c> {
  let g = fst<Fun<a,Fun<b,c>>, Prod<a,b>>().times(snd<Fun<a,Fun<b,c>>, Prod<a,b>>().then(fst())).then(
          apply_pair()).times(snd<Fun<a,Fun<b,c>>, Prod<a,b>>().then(snd())).then(apply_pair())
  return apply(curry(g), f)
}

export interface Exp<b,a> extends Fun<a,b> {}
export let exp : <a,b>(f:(_:a) => b) => Exp<b,a>= fun
export type Plus<a,b> = Sum<a,b>
export type Times<a,b> = Prod<a,b>

export let fst = function <a,b>() : Fun<Prod<a,b>,a> { return fun<Prod<a,b>,a>(p => p.fst) }
export let snd = function <a,b>() : Fun<Prod<a,b>,b> { return fun<Prod<a,b>,b>(p => p.snd) }
export let inl = function <a,b>() : Fun<a, Sum<a,b>> { return fun<a, Sum<a,b>>(x => ({ kind:"left", value:x })) }
export let inr = function <a,b>() : Fun<b, Sum<a,b>> { return fun<b, Sum<a,b>>(x => ({ kind:"right", value:x })) }

// a * (b+c) = a*b + a*c
export let distribute_sum_prod = function<a,b,c>() : Fun<Prod<a, Sum<b,c>>, Sum<Prod<a,b>, Prod<a,c>>> {
  return id<a>().map_times(
    curry(inl<Prod<a,b>, Prod<a,c>>().after(snd<b, a>().times(fst<b, a>()))).plus(
    curry(inr<Prod<a,b>, Prod<a,c>>().after(snd<c, a>().times(fst<c, a>()))))
  ).then(apply_pair<a, Sum<Prod<a,b>,Prod<a,c>>>().after(swap_prod()))
}

export let distribute_sum_prod_inv = function<a,b,c>() : Fun<Sum<Prod<a,b>, Prod<a,c>>, Prod<a, Sum<b,c>>> {
  return fst<a,b>().times(inl<b,c>().after(snd<a,b>())).plus(
         fst<a,c>().times(inr<b,c>().after(snd<a,c>())))
}

// a^(b+c) = a^b * a^c
export let distribute_exp_sum = function<a,b,c>() : Fun<Fun<Plus<a,b>, c>, Prod<Fun<a,c>, Fun<b,c>>> {
  return curry(id<Fun<Plus<a,b>,c>>().map_times(inl<a,b>()).then(apply_pair())).times(
         curry(id<Fun<Plus<a,b>,c>>().map_times(inr<a,b>()).then(apply_pair()))
  )
}

export let distribute_exp_sum_inv = function<a,b,c>() : Fun<Prod<Fun<a,c>, Fun<b,c>>, Fun<Plus<a,b>, c>> {
  return curry(distribute_sum_prod<Prod<Fun<a,c>,Fun<b,c>>, a, b>().then(
    apply_pair<a, c>().after(fst<Fun<a,c>,Fun<b,c>>().map_times(id<a>())).plus(
    apply_pair<b, c>().after(snd<Fun<a,c>,Fun<b,c>>().map_times(id<b>())))))
}

export let distribute_exp_prod = function<a,b,c>() : Fun<Fun<a, Fun<b,c>>, Fun<Prod<a,b>, c>> {
  return curry(apply_pair<a, Fun<b,c>>().after(
    fst<Fun<a, Fun<b,c>>, Prod<a,b>>().times(
    fst<a,b>().after(snd<Fun<a, Fun<b,c>>, Prod<a,b>>()))
  ).times(snd<a,b>().after(snd<Fun<a, Fun<b,c>>, Prod<a,b>>())).then(apply_pair()))
}

export let distribute_exp_prod_inv = function<a,b,c>() : Fun<Fun<Prod<a,b>, c>, Fun<a, Fun<b,c>>> {
  let f = fst<Prod<Fun<Prod<a,b>, c>, a>, b>().then(fst())
  let g = fst<Prod<Fun<Prod<a,b>, c>, a>, b>().then(snd())
  let h = snd<Prod<Fun<Prod<a,b>, c>, a>, b>()
  return curry(curry(f.times(g.times(h)).then(apply_pair())))
}

// a^0 = 1
export let power_of_zero = function<a>() : Fun<Fun<Zero, a>, Unit> {
  return unit()
}

export let power_of_zero_inv = function<a>() : Fun<Unit, Fun<Zero, a>> {
  return curry(absurd<a>().after(snd<Unit,Zero>()))
}

// a^1 = a
// a*1 = 1*a = a
// a+0 = 0+a = a
// a*a = a^2

// c^b^a = c^a^b
export let swap_exp_args = function<a,b,c>() : Fun<Fun<a, Fun<b,c>>, Fun<b, Fun<a,c>>> {
  let f = curry(id<Fun<Prod<a,b>, c>>().map_times(swap_prod<b,a>()).then(apply_pair()))
  return distribute_exp_prod<a,b,c>().then(f).then(distribute_exp_prod_inv())
}

// a*b = b*a
export let swap_prod = function<a,b>() : Fun<Prod<a,b>,Prod<b,a>> {
  return snd<a,b>().times(fst<a,b>())
}
// a+b = b+a
export let swap_sum = function<a,b>() : Fun<Sum<a,b>,Sum<b,a>> { return inr<b,a>().plus(inl<b,a>()) }

// _*c
let map_times_left = function<a,b,c>() : Fun<Fun<a,b>, Fun<Prod<a,c>, Prod<b,c>>> {
  let f = fst<Fun<a,b>, Prod<a,c>>().times(snd<Fun<a,b>, Prod<a,c>>().then(fst())).then(apply_pair())
  let g = snd<Fun<a,b>, Prod<a,c>>().then(snd())
  return curry(f.times(g))
}

// c*_
export let map_times_right = function<a,b,c>() : Fun<Fun<a,b>, Fun<Prod<c,a>, Prod<c,b>>> {
  let f = fst<Fun<a,b>, Prod<c,a>>().times(snd<Fun<a,b>, Prod<c,a>>().then(snd())).then(apply_pair())
  let g = snd<Fun<a,b>, Prod<c,a>>().then(fst())
  let h = (g.times(f))
  return curry(h)
}

// _+c
export let map_sum_left = function<a,b,c>() : Fun<Fun<a,b>, Fun<Sum<a,c>, Sum<b,c>>> {
  let f = distribute_sum_prod<Fun<a,b>, a, c>()
  let g = apply_pair<a,b>()
  let h = snd<Fun<a,b>,c>()
  let i = g.map_plus(h)
  return curry(f.then(i))
}
// c+_
export let map_sum_right = function<a,b,c>() : Fun<Fun<a,b>, Fun<Sum<c,a>, Sum<c,b>>> {
  let f = distribute_sum_prod<Fun<a,b>, c, a>()
  let g = apply_pair<a,b>()
  let h = snd<Fun<a,b>,c>()
  let i = h.map_plus(g)
  return curry(f.then(i))
}

export let lazy = function<a,b>(x:Fun<a,b>) : Fun<Unit,Fun<a,b>> { return curry((id<Unit>().map_times(x)).then(snd<Unit,b>())) }

export let compose_pair = function<a,b,c>() : Fun<Prod<Fun<a,b>,Fun<b,c>>,Fun<a,c>> {
  let f = fst<Fun<a,b>,Fun<b,c>>().map_times(id<a>()).then(apply_pair())
  let g = fst<Prod<Fun<a,b>,Fun<b,c>>, a>().then(snd())
  return curry(g.times(f).then(apply_pair()))
}

// a = a^1
export let lazy_value = function<a>() : Fun<a,Fun<Unit,a>> {
  return curry(fst<a,Unit>())
}

// a^1 = a
export let eager_value = function<a>() : Fun<Fun<Unit,a>,a> {
  return id<Fun<Unit,a>>().times(unit<Fun<Unit,a>>()).then(apply_pair())
}

// a*1 = a
export let product_identity = function<a>() : Fun<Prod<a,Unit>,a> {
  return fst<a,Unit>()
}

// a = a*1
export let product_identity_inv = function<a>() : Fun<a,Prod<a,Unit>> {
  return id<a>().times(unit<a>())
}

// a+0 = a
export let sum_identity = function<a>() : Fun<Sum<a,Zero>,a> {
  return id<a>().plus(absurd<a>())
}

// a = a+0
export let sum_identity_inv = function<a>() : Fun<a,Sum<a,Zero>> {
  return inl<a,Zero>()
}

export let plus_cat = function<a,b,c>() : Fun<Prod<Fun<a,c>,Fun<b,c>>, Fun<Sum<a,b>,c>> {
  return fun2((f:Fun<a,c>,g:Fun<b,c>) => f.plus(g))
}

export let plus_par_cat = function<a,b,c,d>() : Fun<Prod<Fun<a,c>,Fun<b,d>>, Fun<Sum<a,b>,Sum<c,d>>> {
  return fun2((f:Fun<a,c>,g:Fun<b,d>) => f.map_plus(g))
}

// a*a = a^2
export let prod_to_fun = function<a>() : Fun<Prod<a,a>, Fun<Sum<Unit,Unit>,a>> {
  return lazy_value<a>().map_times(lazy_value<a>()).then(plus_cat())
}

// a^2 = a*a
export let prod_from_fun = function<a>() : Fun<Fun<Sum<Unit,Unit>,a>, Prod<a,a>> {
  let f1 = id<Fun<Sum<Unit,Unit>,a>>().times(unit<Fun<Sum<Unit,Unit>,a>>().then(inl<Unit,Unit>())).then(apply_pair())
  let f2 = id<Fun<Sum<Unit,Unit>,a>>().times(unit<Fun<Sum<Unit,Unit>,a>>().then(inr<Unit,Unit>())).then(apply_pair())
  return f1.times(f2)
}

// a*0 = 0
export let times_zero = function<a>() : Fun<Prod<a,Zero>,Zero> {
  return snd<a,Zero>()
}

export let times_zero_inv = function<a>() : Fun<Zero,Prod<a,Zero>> {
  return absurd<a>().times(id<Zero>())
}
