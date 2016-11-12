import test from 'ava';
import lib from '../';
import babel from './helpers/babel';
import espree from './helpers/espree';

const toValue = value => ({value});

[espree, babel].forEach(({name, utils}) => {
	test(`(${name}) should return undefined if node is a not an expression`, t => {
		t.true(undefined === lib.computeStaticExpression(null));
		t.true(undefined === lib.computeStaticExpression(utils.statement(`foo = 2`)));
		t.true(undefined === lib.computeStaticExpression(utils.program(`foo = 2`)));
	});

	test(`(${name}) should return undefined if node is a variable name`, t => {
		t.true(undefined === lib.computeStaticExpression(utils.expression(`foo`)));
	});

	test(`(${name}) should return value undefined if node is the 'undefined' Literal`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`undefined`)), toValue(undefined));
	});

	test(`(${name}) should return the node's value if node is a Literal`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`null`)), toValue(null));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`'foo'`)), toValue('foo'));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`0`)), toValue(0));
	});

	test(`(${name}) should return the value if node is a Literal`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`null`)), toValue(null));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`'foo'`)), toValue('foo'));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`'undefined'`)), toValue('undefined'));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`'null'`)), toValue('null'));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`0`)), toValue(0));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1`)), toValue(1));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`0.5`)), toValue(0.5));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`.5`)), toValue(0.5));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`0x90`)), toValue(144));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`true`)), toValue(true));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`false`)), toValue(false));
	});

	test(`(${name}) should return the node's content if node is a TemplateLiteral without dynamic content`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression('``')), toValue(''));
		t.deepEqual(lib.computeStaticExpression(utils.expression('`foo`')), toValue('foo'));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`\`foo
bar\``)), toValue('foo\nbar'));
	});

	test(`(${name}) should return the node's content if node is a TemplateLiteral with dynamic content that is statically knowable`, t => {
		/* eslint-disable no-template-curly-in-string */
		t.deepEqual(lib.computeStaticExpression(utils.expression('`foo ${"bar"}`')), toValue('foo bar'));
		t.deepEqual(lib.computeStaticExpression(utils.expression('`foo ${1 + 2}`')), toValue('foo 3'));
		/* eslint-enable no-template-curly-in-string */
	});

	test(`(${name}) should return undefined if node is a TemplateLiteral with dynamic content`, t => {
		/* eslint-disable no-template-curly-in-string */
		t.true(undefined === lib.computeStaticExpression(utils.expression('`foo ${bar}`')));
		t.true(undefined === lib.computeStaticExpression(utils.expression('`${foo}`')));
		t.true(undefined === lib.computeStaticExpression(utils.expression('`${foo} ${"foo"}`')));
		/* eslint-enable no-template-curly-in-string */
	});

	test(`(${name}) should return the value if node is a unary expression`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`+1`)), toValue(+1));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`-1`)), toValue(-1));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`~1`)), toValue(-2));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`!1`)), toValue(false));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`!0`)), toValue(true));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`!!0`)), toValue(false));
	});

	test(`(${name}) should return the value of a number addition`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`0 + 1`)), toValue(1));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`0 + -1`)), toValue(-1));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`0b110 + 1`)), toValue(7));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`0x90 + 1`)), toValue(145));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 + 1`)), toValue(101));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1 + 2 + 3`)), toValue(6));
	});

	test(`(${name}) should return the value of a string concatenation`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`'0' + '1'`)), toValue('01'));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`'foo' + 'bar'`)), toValue('foobar'));
	});

	test(`(${name}) should return the value of a mixed types addition`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`'foo' + 0`)), toValue('foo0'));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`0 + 'foo'`)), toValue('0foo'));
	});

	test(`(${name}) should return the value of a number subtraction`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 - 1`)), toValue(99));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 - 2 - 1`)), toValue(97));
	});

	test(`(${name}) should return the value of a logical expression`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`true && false`)), toValue(false));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`true || false`)), toValue(true));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`false && true`)), toValue(false));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`false || true`)), toValue(true));
	});

	test(`(${name}) should return the value of other binary operators`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 % 3`)), toValue(1));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 ** 2`)), toValue(10000));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 + 2 ** 2`)), toValue(104));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 << 2`)), toValue(400));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 >> 2`)), toValue(25));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 >>> 2`)), toValue(25));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`10 & 2`)), toValue(2));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 | 2`)), toValue(102));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`10 ^ 2`)), toValue(10));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1 === 1`)), toValue(true));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1 !== 1`)), toValue(false));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1 == 1`)), toValue(true));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1 != 1`)), toValue(false));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1 < 2`)), toValue(true));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1 > 2`)), toValue(false));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1 <= 2`)), toValue(true));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`1 >= 2`)), toValue(false));
	});

	test(`(${name}) should return the value of multiplication`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 * 2`)), toValue(200));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 * 2 + 1`)), toValue(201));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 + 2 * 1`)), toValue(102));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`(100 + 2) * 10`)), toValue(1020));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 - 2 * 1`)), toValue(98));
	});

	test(`(${name}) should return the value of division`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 / 2`)), toValue(50));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 / 2 + 1`)), toValue(51));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 + 20 / 2`)), toValue(110));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`(100 + 20) / 2`)), toValue(60));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`100 + (20 / 2)`)), toValue(110));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`10 * 20 / 2`)), toValue(100));
	});

	test(`(${name}) should return the value of a ternary expression`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`true ? 1 : 2`)), toValue(1));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`false ? 1 : 2`)), toValue(2));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`true ? 1 : foo`)), toValue(1));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`false ? foo : 2`)), toValue(2));
	});

	test(`(${name}) should return value undefined when using the 'void' unary operator`, t => {
		t.deepEqual(lib.computeStaticExpression(utils.expression(`void 2`)), toValue(undefined));
		t.deepEqual(lib.computeStaticExpression(utils.expression(`void foo`)), toValue(undefined));
	});

	test(`(${name}) should undefined if one of the operands of a ternary expression is not statically knowable`, t => {
		t.true(undefined === lib.computeStaticExpression(utils.expression(`foo ? 1 : 2`)));
		t.true(undefined === lib.computeStaticExpression(utils.expression(`true ? foo : 2`)));
		t.true(undefined === lib.computeStaticExpression(utils.expression(`false ? 1 : foo`)));
	});

	test(`(${name}) should return undefined if the value of a unary expression is not statically knowable`, t => {
		t.true(undefined === lib.computeStaticExpression(utils.expression(`!foo`)));
	});

	test(`(${name}) should return undefined if one of the value of a binary expression is not statically knowable`, t => {
		t.true(undefined === lib.computeStaticExpression(utils.expression(`foo + 0`)));
		t.true(undefined === lib.computeStaticExpression(utils.expression(`0 + foo`)));
	});

	test(`(${name}) should return undefined if one of the value of a logical expression is not statically knowable`, t => {
		t.true(undefined === lib.computeStaticExpression(utils.expression(`foo || true`)));
		t.true(undefined === lib.computeStaticExpression(utils.expression(`foo && true`)));
		t.true(undefined === lib.computeStaticExpression(utils.expression(`true || foo`)));
		t.true(undefined === lib.computeStaticExpression(utils.expression(`true && foo`)));
	});
});
