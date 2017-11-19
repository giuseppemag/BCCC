"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Option = require("./option");
var Lexer = require("./lexer");
var source = "if x = 0 then\n  print x\n\n  if y = 0 then\n\n    print y\n\n  else\n\n    print w\nelse\n  print z\n";
var newline = ({ kind: "Newline" });
var indent = ({ kind: "Indent" });
var deindent = ({ kind: "Deindent" });
var int = function (s) { return !/^[0-9]+$/.test(s) ? Option.none() : Option.some({ kind: "int", v: parseInt(s) }); };
var float = function (s) { return !/^[0-9]+.[0-9]+$/.test(s) ? Option.none() : Option.some({ kind: "float", v: parseFloat(s) }); };
var _if = function (s) { return !/^if$/.test(s) ? Option.none() : Option.some({ kind: "if" }); };
var _eq = function (s) { return !/^=$/.test(s) ? Option.none() : Option.some({ kind: "=" }); };
var _then = function (s) { return !/^then$/.test(s) ? Option.none() : Option.some({ kind: "then" }); };
var _else = function (s) { return !/^else$/.test(s) ? Option.none() : Option.some({ kind: "else" }); };
var identifier = function (s) { return !/^[a-zA-Z][a-zA-Z0-9]*$/.test(s) ? Option.none() : Option.some({ kind: "identifier", v: s }); };
// console.log(//Lexer.pre_process_indentation(source))
Lexer.tokenize(Lexer.pre_process_indentation(source), function (_) { return newline; }, function (_) { return indent; }, function (_) { return deindent; }, Option.merge(int, Option.merge(float, Option.merge(_if, Option.merge(_eq, Option.merge(_then, Option.merge(_else, identifier)))))));
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
var language = {};
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
//# sourceMappingURL=language_spec.js.map