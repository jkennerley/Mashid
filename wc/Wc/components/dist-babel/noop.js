"use strict";

// ...
//console.log("noop.ts");

console.log("");

var foo = function foo() {
    var a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    console.log(a + " " + b + " ");
};