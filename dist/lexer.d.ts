import * as CCC from "./ccc";
export declare type LineIndentationStep = {
    kind: "indent";
} | {
    kind: "line";
    v: string;
} | {
    kind: "deindent";
};
export declare let line: (l: string) => LineIndentationStep;
export declare let INDENT: LineIndentationStep;
export declare let DEINDENT: LineIndentationStep;
export declare let pre_process_indentation: (s: string) => LineIndentationStep[];
export declare let tokenize: <Token>(lines: LineIndentationStep[], newline: (_: CCC.Unit) => Token, indent: (_: CCC.Unit) => Token, deindent: (_: CCC.Unit) => Token, parse_token: (_: string) => CCC.Sum<Token, CCC.Unit>) => CCC.Sum<Token[], CCC.Unit>;
