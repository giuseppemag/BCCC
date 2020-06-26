interface Fun<a, b> {
    (a: a): b;
    then<c>(g: Fun<b, c>): Fun<a, c>;
}
declare const Fun: <a, b>(f: (a: a) => b) => Fun<a, b>;
declare const f: Fun<number, number>;
