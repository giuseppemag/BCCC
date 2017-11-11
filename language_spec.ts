import * as Immutable from "immutable"
import {fun, Prod, apply, curry, id, inl, inr, unit} from "./ccc"
import * as CCC from "./ccc"
import * as Option from "./option"
import * as Lexer from "./lexer"

let source = `if x = 0 then
  print x

  if y = 0 then

    print y

  else

    print w
else
  print z
`

type Token = { kind:"Newline"} | { kind:"Indent"} | { kind:"Deindent"}
  | { kind:"int", v:number } | { kind:"float", v:number }
  | { kind:"if" } | { kind:"then" } | { kind:"else" }
  | { kind:"identifier", v:string }
  | { kind:"=" }

let newline:Token = ({ kind:"Newline" })
let indent:Token = ({ kind:"Indent" })
let deindent:Token = ({ kind:"Deindent" })
let int : (_:string) => Option.Option<Token>
        = s => !/^[0-9]+$/.test(s) ? Option.none() : Option.some<Token>({ kind:"int", v:parseInt(s) })
let float : (_:string) => Option.Option<Token>
        = s => !/^[0-9]+.[0-9]+$/.test(s) ? Option.none() : Option.some<Token>({ kind:"float", v:parseFloat(s) })
let _if : (_:string) => Option.Option<Token>
        = s => !/^if$/.test(s) ? Option.none() : Option.some<Token>({ kind:"if" })
let _eq : (_:string) => Option.Option<Token>
        = s => !/^=$/.test(s) ? Option.none() : Option.some<Token>({ kind:"=" })
let _then : (_:string) => Option.Option<Token>
        = s => !/^then$/.test(s) ? Option.none() : Option.some<Token>({ kind:"then" })
let _else : (_:string) => Option.Option<Token>
        = s => !/^else$/.test(s) ? Option.none() : Option.some<Token>({ kind:"else" })
let identifier : (_:string) => Option.Option<Token>
        = s => !/^[a-zA-Z][a-zA-Z0-9]*$/.test(s) ? Option.none() : Option.some<Token>({ kind:"identifier", v:s })

// console.log(//Lexer.pre_process_indentation(source))
Lexer.tokenize<Token>(Lexer.pre_process_indentation(source),
  _ => newline, _ => indent, _ => deindent,
  Option.merge<string, Token>(int,
  Option.merge<string, Token>(float,
  Option.merge<string, Token>(_if,
  Option.merge<string, Token>(_eq,
  Option.merge<string, Token>(_then,
  Option.merge<string, Token>(_else,
    identifier)))))))

// type Parser <S,E,A> = {
//     parse: CCC.Exp<S, CCC.Sum<CCC.Prod<A,S>,E>>
//     then: <B>(k: (_: A) => Parser <S,E,B>) => Parser <S,E,B>;
//     never: <B>() => Parser <S,E,B>;
//     ignore: () => Parser <S,E,CCC.Unit>;
//     ignore_with: <B>(x: B) => Parser <S,E,B>;
//     map: <B>(f: CCC.Exp<A,B>) => Parser <S,E,B>;
//     filter: (f: CCC.Exp<A,boolean>) => Parser <S,E,A>;
// }

// let join : <S,E,A>(p:Parser<S,E,Parser<S,E,A>>) => Parser<S,E,A> = undefined
// let map  : <S,E,A,B>(p:Parser<S,E,A>) => (_:CCC.Exp<A,B>) => Parser<S,E,A> = undefined
// let fail : <S,E,A>(error:E) => Parser<S,E,A> = undefined
// let parser : <S,E,A>(_:(_:S) => CCC.Sum<CCC.Prod<A,S>,E>) => Parser<S,E,A> = undefined
// let unit : <S,E,A>(x:A) => Parser<S,E,A> = undefined
// let plus : <S,E,A,B>(_:Parser<S,E,A>) => (_:Parser<S,E,B>) => Parser<S,E,CCC.Sum<A,B>> = undefined
// let times : <S,E,A,B>(_:Parser<S,E,A>) => (_:Parser<S,E,B>) => Parser<S,E,CCC.Prod<A,B>> = undefined

// type Language?
// language to lexer and then parser and then semantics

let language = {
  // expr: {
  //   true: {
  //     syntax: "True",
  //     semantics: fun(inl).after(fun(inl).after(fun(unit)))
  //   },
  //   false: {
  //     syntax: "False",
  //     semantics: fun(inl).after(fun(inr).after(fun(unit)))
  //   }
  // },

  // stmt: {
  //   if_then_else: {
  //       syntax: any([
  //         ["if", expr("c"), "then", stmt("p"), "else", stmt("q")],
  //         ["if", expr("c"), "then", indent_block(stmt("p")), "else", indent_block(stmt("q"))]
  //       ],
  //       semantics: semantics("c").after((semantics("p").plus(semantics("q"))).plus(error("a conditional expression must result in a boolean")))
  //     }
  // }
}

/* still open questions:
- how is the source map managed? Automatically?
- how are functions and function definitions managed?
- while's?
- how is type safety guaranteed? By the underlying union types?
- how is state managed?
  - how are stacks managed
  - where are variables stored?
- how are large tuples/sums managed?
- how does the lexer work?
- how does the type checker work?
*/
