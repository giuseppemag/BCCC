"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Immutable = require("immutable");
var ccc_1 = require("./ccc");
var CCC = require("./ccc");
var Option = require("./option");
exports.line = function (l) { return ({ kind: "line", v: l }); };
exports.INDENT = { kind: "indent" };
exports.DEINDENT = { kind: "deindent" };
exports.pre_process_indentation = function (s) {
    var split_lines = ccc_1.fun(function (s) { return s.split("\n"); });
    var remove_empty_lines = ccc_1.fun(function (ls) { return ls.filter(function (l) { return !/^\s*$/.test(l); }); });
    var add_blank_prefix_size = ccc_1.fun(function (ls) { return ls.map(ccc_1.id().times(ccc_1.fun(function (l) { return /^\s*/.exec(l)[0].length; })).f); });
    var preprocess_lines = split_lines.then(remove_empty_lines.then(add_blank_prefix_size));
    var lines_with_prefix = ccc_1.apply(preprocess_lines, s);
    var output = [];
    var indentation_depth = Immutable.Stack();
    for (var i = 0; i < lines_with_prefix.length - 1; i++) {
        var l = lines_with_prefix[i].fst;
        var l_ind = lines_with_prefix[i].snd;
        if (l_ind < lines_with_prefix[i + 1].snd) {
            indentation_depth = indentation_depth.push([l, lines_with_prefix[i + 1].snd]);
            output.push(exports.line(l));
            output.push(exports.INDENT);
        }
        else if (l_ind > lines_with_prefix[i + 1].snd) {
            output.push(exports.line(l));
            var target_depth = lines_with_prefix[i + 1].snd;
            // should keep popping * deindenting until <= lines_with_prefix[i+1][1]
            while (!indentation_depth.isEmpty() && indentation_depth.peek()[1] > target_depth) {
                indentation_depth = indentation_depth.pop();
                output.push(exports.DEINDENT);
            }
        }
        else {
            output.push(exports.line(l));
        }
    }
    output.push(exports.line(lines_with_prefix[lines_with_prefix.length - 1].fst));
    output = output.concat(Immutable.Repeat(exports.DEINDENT, indentation_depth.count()).toArray());
    return output;
};
exports.tokenize = function (lines, newline, indent, deindent, parse_token) {
    try {
        var line_words = lines.map(function (l) {
            return (l.kind == "indent" ? [indent(CCC.unit().f(null))]
                : l.kind == "deindent" ? [deindent(CCC.unit().f(null))]
                    : (_a = Array()).concat.apply(_a, l.v.split(/\s+/g).filter(function (s) { return /^\s*$/g.test(s) == false; }).map(function (w) {
                        var t = parse_token(w);
                        console.log("Parsed token " + w + " to " + JSON.stringify(t.value));
                        if (t.kind == "right") {
                            console.log("Cannot parse token " + w);
                            throw "Cannot parse token " + w;
                        }
                        return t;
                    }).map(function (mt) { return Option.to_array(mt); }))).concat([newline(null)]);
            var _a;
        });
        return Option.some((_a = Array()).concat.apply(_a, line_words));
    }
    catch (error) {
        return Option.none();
    }
    var _a;
};
//# sourceMappingURL=lexer.js.map