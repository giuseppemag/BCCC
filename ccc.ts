export let id = <a>(x:a) : a => x
export type Unit = {}
export let unit = <a>(x:a) : Unit => ({})

export type Sum<a,b> = { kind:"left", value:a } | { kind:"right", value:b }
export let inl = <a,b>(x:a) : Sum<a,b> => ({ kind:"left", value:x })
export let inr = <a,b>(x:b) : Sum<a,b> => ({ kind:"right", value:x })
export let plus = <c,a,b>(f:(_:a) => c, g:(_:b) => c) => (x:Sum<a,b>) => x.kind == "left" ? f(x.value) : g(x.value)
export let plus_par = <a,b,c,d>(f:(_:a) => c, g:(_:b) => d) => (x:Sum<a,b>) : Sum<c,d> => x.kind == "left" ? inl(f(x.value)) : inr(g(x.value))

export type Prod<a,b> = { fst:a, snd:b }
export let mk_pair = <a,b>(x:a) : (y:b) => Prod<a,b> => y => ({ fst:x, snd:y })
export let fst = <a,b>(p:Prod<a,b>) : a => p.fst
export let snd = <a,b>(p:Prod<a,b>) : b => p.snd
export let times = <c,a,b>(f:(_:c) => a, g:(_:c) => b) => (x:c) : Prod<a,b> => ({ fst:f(x), snd:g(x) })
export let times_par = <a,b,c,d>(f:(_:a) => c, g:(_:b) => d) => (x:Prod<a,b>) : Prod<c,d> => ({ fst:f(x.fst), snd:g(x.snd) })
export let times_into = <c,a,b>(f:(_:a) => (_:b) => c) => (p:Prod<a,b>) : c => f(p.fst)(p.snd)

export type Exp<a,b> = { f:(_:a) => b, after:<c>(f:Exp<c,a>) => Exp<c,b>, then:<c>(f:Exp<b,c>) => Exp<a,c> }
export let fun = <a,b>(f:(_:a) => b) : Exp<a,b> => ({
    f:f,
    after: <c>(g:Exp<c,a>) : Exp<c,b> => fun<c,b>((x) => f(g.f(x))),
    then: <c>(g:Exp<b,c>) : Exp<a,c> => fun<a,c>((x) => g.f(f(x)))
  })
export let curry = <a,b,c>(f:(_:a,__:c) => b) : (_:c) => Exp<a,b> => c => fun(a => f(a,c))
export let apply = <a,b>(f:Exp<a,b>, x:a) : b => f.f(x)


// let f = fun<number,number>(x => x * 2)
// let g = fun<number,number>(y => y + 1)
// let h = f.after(g)
// let i = h.after(h)
// console.log(apply(i, 10))
