//console.log("noop.ts");

let foo = function (a = 0, b = 0) {
    console.log(`${a} ${b} `);
}

var Calculator = function () { };

Calculator.prototype.add = function (a, b) { return a + b; };