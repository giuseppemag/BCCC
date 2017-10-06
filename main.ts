module Product {
  export type Product<a,b> = { fst:a, snd:b }
}

module Sum {
  export type Sum<a,b> = { kind:"left", value:a } | { kind:"right", value:b }
}

module Exp {
  export type Exp<b,a> = { f:(_:a) => b }
}

console.log("...")


/*
TODO: use this style of interface + constructor function for all BCCC datatypes
*/
interface Point {
  x: number;
  y: number;
  toString(): string;
}

let Point: {
  new (x: number, y: number): Point;
} = <any> function (this:Point, x: number, y: number): void {
  console.log("inside constructor", this, x, y)
  this.x = x
  this.y = y
  this.toString = function(this:Point) : string { return JSON.stringify(this) }
};

let p = new Point(5, 10)
console.log(p.toString())
