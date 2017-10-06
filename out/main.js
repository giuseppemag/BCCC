"use strict";
console.log("...");
var Point = function (x, y) {
    console.log("inside constructor", this, x, y);
    this.x = x;
    this.y = y;
    this.toString = function () { return JSON.stringify(this); };
};
var p = new Point(5, 10);
console.log(p.toString());
