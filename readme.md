# Short introduction

TS-BCCC stands for "TypeScript Bi-Cartesian Closed Categories". TS-BCCC is a TypeScript library which implements a
generic, expressive, and high performance series of universal combinators. These combinators can be used in many
applications as a solid and reliable basis for building complex constructions such as monads, some of which are
hierby included.



## Getting started

Download the library with `npm install ts-bccc` or `yarn add ts-bccc`.

To start playing around with simple function pipelining, try the following:

```
import { Fun, fun, apply } from "ts-bccc";

let incr:Fun<number,number> = fun(x => x + 1)
let double:Fun<number,number> = fun(x => x * 2)
console.log(apply(incr.then(double.then(incr)), 3))
```

The sample builds a pipeline which first increments, then double, then increments again, and the pipeline is then
invoked ("applied to") the number `3`, leading us to an output of `9`.


### More complex data-types

We can build more complex datatypes such as tuples (_products_) and discriminated unions (_sums_). All datatypes
can be mapped into datatypes with the same structure (products to products, sums to sums), or constructed/destroyed
(value to product, sum to value).

The following example shows the mapping of a tuple:

```
import { Fun, fun, apply, Times } from "ts-bccc";

let incr:Fun<number,number> = fun(x => x + 1)
let double:Fun<number,number> = fun(x => x * 2)
let pair_transform:Fun<Times<number,number>, Times<number,number>> = incr.map_times(double)
console.log(apply(pair_transform, { fst:4, snd:2 }))
```

`(4,2)` is thus transformed into `(5,4)`.

A product can be created from a single value and two functions which determine the values of the elements of the tuple:

```
let incr:Fun<number,number> = fun(x => x + 1)
let double:Fun<number,number> = fun(x => x * 2)
let mk_tuple:Fun<number, Times<number,number>> = incr.times(double)
console.log(apply(mk_tuple, 3))
```

`3` is thus transformed into `(4,6)`.


The dual operators are available for sums: `map_plus` and `plus`.


### A library of equivalences

Given that the library implements Bi-Cartesian Closed Categories, there exist a series of equivalences which lead us to
useful transformations between data types. The interesting bit of these transformations is that they mirror exactly a
series of well-known equivalences from arithmetics. This makes these equivalences very easy to manipulate, as we do not
need any effort to remember concepts such as `a*(b+c) = a*b+a*c`.

An equivalence such as `a*(b+c) = a*b+a*c` are reformulated as a series of built-in library functions such as:

`distribute_sum_prod = function<a,b,c>() : Fun<Prod<a, Sum<b,c>>, Sum<Prod<a,b>, Prod<a,c>>>`
`distribute_sum_prod_inv = function<a,b,c>() : Fun<Sum<Prod<a,b>, Prod<a,c>>, Prod<a, Sum<b,c>>>`

An equivalence such as `a^(b+c) = a^b * a^c` is encoded as:

`distribute_exp_sum = function<a,b,c>() : Fun<Fun<Plus<a,b>, c>, Prod<Fun<a,c>, Fun<b,c>>>`
``distribute_exp_sum_inv = function<a,b,c>() : Fun<Prod<Fun<a,c>, Fun<b,c>>, Fun<Plus<a,b>, c>>`


Even simpler equivalences such as `a+0 = a` find their place, for example:

`sum_identity = function<a>() : Fun<Sum<a,Zero>,a>`
`sum_identity_inv = function<a>() : Fun<a,Sum<a,Zero>>`


### Examples of monads

Within the framework of Bi-Cartesian Closed Categories it is also possible to give a very elegant implementation of monads
as _monoids in the category of endofunctors_. Monads are all (often articulated) endofunctors, but they can be built more easily
as compositions of the generic types `Plus`, `Times`, and `Fun`, which themselves are (bi-)endofunctors as well.

For this reason, we can implement for example the `State` monad as `State<S,A> = CCC.Fun<S, CCC.Prod<A,S>>`, together with
the required monadic operators:

`st_map: function<B>(p:State<S,A>, f: CCC.Fun<A,B>) : State<S,B>`
`st_join = function<S,A>(pp:State<S,State<S,A>>) : State<S,A>`
`st_unit = function<S,A>(x:A) : State<S,A>`

To be able to effectively use such a monad, we define a wrapper type which features more useful operators such as
binding (`then`), thereby also mirroring standard library constructs such as `Promise`:

```
export interface St<S,A> extends CCC.Fun<S, CCC.Prod<A,S>> {}
export type State <S,A> = {
  run: St<S,A>,
  then: <B>(k: (_: A) => State <S,B>) => State <S,B>;
  ignore: () => State<S,CCC.Unit>;
  ignore_with: <B>(x:B) => State<S,B>;
  map: <B>(f: CCC.Fun<A,B>) => State <S,B>
}
```

It is noteworthy to realise that all of these operators are implemented fully and exclusively with the basic operators
on products, sums, etc. which we have seen previously, leading us to a very homogeneous implementation overall. For example,
notice how all of the following functions are no more than long BCCC pipelines:

```
export let st_run = function<s,a>() : Fun<State<s,a>, St<s,a>> { return fun(p => p.run) }

export let st_join = function<S,A>(pp:State<S,State<S,A>>) : State<S,A> {
  let g = fst<State<S,A>,S>().then(st_run<S,A>()).times(snd<State<S,A>,S>()).then(apply_pair())
  let h = st_run<S,State<S,A>>().map_times(id<S>()).then(apply_pair()).then(g)
  return mk_state<S,A>(apply(curry(h), pp))
}

export let st_get_state = function<S>() : State<S,S> { return mk_state<S,S>(id<S>().times(id<S>())) }
export let st_set_state = function<S>(s:S) : State<S,Unit> { return mk_state<S,Unit>(unit<S>().times(constant<S,S>(s))) }

export let st_unit = function<S,A>(x:A) : State<S,A> { return mk_state<S,A>(constant<S,A>(x).times(id<S>())) }

```

For an extensive example on using these monads in the practical implementation of a high performance meta-interpreter
embedded in TypeScript, head over to [ts-bccc-meta-interpreter](https://github.com/giuseppemag/ts-bccc-meta-interpreter).
