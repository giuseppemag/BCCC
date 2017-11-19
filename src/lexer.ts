import * as Immutable from "immutable"
import {fun, Prod, apply, curry, id, inl, inr, unit} from "./ccc"
import * as CCC from "./ccc"
import * as Option from "./option"

export type LineIndentationStep = { kind:"indent" } | { kind:"line", v:string } | { kind:"deindent" }
export let line = (l:string) : LineIndentationStep => ({ kind:"line", v:l })
export let INDENT : LineIndentationStep = { kind:"indent" }
export let DEINDENT : LineIndentationStep = { kind:"deindent" }

export let pre_process_indentation = (s:string) : Array<LineIndentationStep> => {
  let split_lines = fun<string, string[]>(s => s.split("\n"))
  let remove_empty_lines = fun<string[], string[]>(ls => ls.filter(l => !/^\s*$/.test(l)))
  let add_blank_prefix_size = fun<string[], Prod<string, number>[]>(ls => ls.map<Prod<string, number>>(
    id<string>().times(fun(l => /^\s*/.exec(l)[0].length)).f
  ))

  let preprocess_lines = split_lines.then(remove_empty_lines.then(add_blank_prefix_size))
  let lines_with_prefix = apply(preprocess_lines, s)
  let output : Array<LineIndentationStep> = []
  let indentation_depth = Immutable.Stack<[string,number]>()
  for (let i = 0; i < lines_with_prefix.length - 1; i++) {
    let l = lines_with_prefix[i].fst
    let l_ind = lines_with_prefix[i].snd
    if (l_ind < lines_with_prefix[i+1].snd) {
      indentation_depth = indentation_depth.push([l,lines_with_prefix[i+1].snd])
      output.push(line(l))
      output.push(INDENT)
    } else if (l_ind > lines_with_prefix[i+1].snd) {
      output.push(line(l))
      let target_depth = lines_with_prefix[i+1].snd
      // should keep popping * deindenting until <= lines_with_prefix[i+1][1]
      while (!indentation_depth.isEmpty() && indentation_depth.peek()[1] > target_depth) {
        indentation_depth = indentation_depth.pop()
        output.push(DEINDENT)
      }
    } else {
      output.push(line(l))
    }
  }
  output.push(line(lines_with_prefix[lines_with_prefix.length-1].fst))
  output = output.concat(Immutable.Repeat(DEINDENT, indentation_depth.count()).toArray())
  return output
}

export let tokenize = <Token>(lines:Array<LineIndentationStep>, newline:(_:CCC.Unit) => Token, indent:(_:CCC.Unit) => Token, deindent:(_:CCC.Unit) => Token, parse_token:(_:string) => Option.Option<Token>) : Option.Option<Array<Token>> => {
  try {
    let line_words = lines.map<Array<Token>>(l =>
      (l.kind == "indent" ? [indent(CCC.unit().f(null))]
      : l.kind == "deindent" ? [deindent(CCC.unit().f(null))]
      : Array<Token>().concat(...l.v.split(/\s+/g).filter(s => /^\s*$/g.test(s) == false).map(w =>
        {
          let t = parse_token(w)
          console.log(`Parsed token ${w} to ${JSON.stringify(t.value)}`)
          if (t.kind == "right") {
            console.log(`Cannot parse token ${w}`)
            throw `Cannot parse token ${w}`
          }
          return t
        }
      ).map(mt => Option.to_array(mt)))).concat([newline(null)])
    )
    return Option.some<Array<Token>>(Array<Token>().concat(...line_words))
  } catch (error) {
    return Option.none<Array<Token>>()
  }
}
