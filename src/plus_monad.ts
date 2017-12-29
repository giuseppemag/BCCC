import { Sum, Prod, Unit, Fun, id, constant, plus_cat, plus_par_cat } from './ccc'

export let map_plus_left = function<a,b,c>() : Fun<Fun<a,c>,Fun<Sum<a,b>, Sum<c,b>>> {
  let f = id<Fun<a,c>>().times(constant<Fun<a,c>,Fun<b,b>>(id<b>()))
  return f.then(plus_par_cat())
}

export let map_plus_right = function<a,b,c>() : Fun<Fun<b,c>,Fun<Sum<a,b>, Sum<a,c>>> {
  let f = constant<Fun<b,c>,Fun<a,a>>(id<a>()).times(id<Fun<b,c>>())
  return f.then(plus_par_cat())
}
