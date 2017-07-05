// ava test demo .js
// https://github.com/avajs/ava#magic-assert
// https://github.com/avajs/ava#throwsfunctionpromise-error-message
// https://www.npmjs.com/package/ava-assert
import test from 'ava'

test("ava assert pass", t => {
    t.pass("ava-assert-message");
});

//test("ava assert fail", t => {
//    //t.fail("ava-message");
//});

test("ava assert truthy", t => {
    t.truthy(1,"ava-assert-message");
});

test("ava assert falsy", t => {
    t.falsy(false, "ava-assert-message");
});

test("ava assert true", t => {
    t.true(true, "ava-assert-message");
});

test("ava assert true", t => {
    t.false(false, "ava-assert-message");
});

test("ava assert is", t => {
    let actual = 0;
    let expected = 0;
    t.is( actual, expected ,"ava-assert-message");
});

test("ava assert not", t => {
    let actual = 0;
    let expected = 1;
    t.not( actual, expected ,"ava-assert-message");
});

test("ava assert not", t => {
    let actual = 0;
    let expected = 1;
    t.not( actual, expected ,"ava-assert-message");
});

test("ava assert deepEqual", t => {
    let actual = [1, 2];
    //let expected = [1, 1];
    let expected = [1, 2];
    t.deepEqual( actual, expected , "ava-assert-message" );
});

test("ava assert noDeepEqual", t => {
    let actual = [1, 2];
    let expected = [1, 1];
    //let expected = [1, 2];
    t.notDeepEqual( actual, expected , "ava-assert-message" );
});

const fn1 = () => {throw new TypeError('🦄');};
test('ava assert throws example 1', t => {
    t.throws(() => {fn1();}, TypeError);
    //const error = t.throws(() => {fn();}, TypeError);
    //t.is(error.message, '🦄');
});

const fn2 = () => {throw new TypeError('ONE');};
test('ava assert throws example 2', t => {
    t.throws(() => {fn2();}, "ONE");
});

const fn = () => {throw new TypeError('1');};
test('ava assert throws example', t => {
    t.throws(() => {fn();}, TypeError);
    const error = t.throws(() => {fn();}, TypeError);
    t.is(error.message, '1');
});

const fnNotThrow = () => {
    //throw new TypeError('1');
    //return 0;
};
test('ava assert throws example', t => {
    t.notThrows(() => {fnNotThrow();}, TypeError);
});

test('ava assert regex', t => {
    t.regex("abc",  /abc/ );
});

test('ava assert notRegex', t => {
    t.notRegex("ab",  /abc/ );
});

//////////////////////////////////
//test('ava assert ifError', t => {
//
//    //let error = null;
//    let error = 1;
//    //t.ifError( error );
//});
//...................................