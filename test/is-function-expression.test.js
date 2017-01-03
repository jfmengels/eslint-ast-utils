import test from 'ava';
import lib from '../';
import babel from './helpers/babel';
import espree from './helpers/espree';

[espree, babel].forEach(({name, utils}) => {
	test(`(${name}) should return false if node is not a function expression`, t => {
		t.false(lib.isFunctionExpression(null));
		t.false(lib.isFunctionExpression(utils.expression(`null`)));
		t.false(lib.isFunctionExpression(utils.expression(`42`)));
		t.false(lib.isFunctionExpression(utils.expression('`42`')));
		t.false(lib.isFunctionExpression(utils.expression(`(function() {})()`)));
	});

	test(`(${name}) should return true if node is a function expression`, t => {
		t.true(lib.isFunctionExpression(utils.expression(`(function() {})`)));
		t.true(lib.isFunctionExpression(utils.expression(`(function foo() {})`)));
	});

	test(`(${name}) should return true if node is an arrow function expression`, t => {
		t.true(lib.isFunctionExpression(utils.expression(`() => {}`)));
		t.true(lib.isFunctionExpression(utils.expression(`a => a`)));
	});
});
