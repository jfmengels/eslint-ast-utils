import test from 'ava';
import lib from '../';
import utils from './helpers/utils';

test('should return false if node is falsy or not a node', t => {
	t.false(lib.isStaticRequire(null));
	t.false(lib.isStaticRequire(undefined));
	t.false(lib.isStaticRequire({}));
	t.false(lib.isStaticRequire('foo'));
});

test('should return false if node is not a CallExpression', t => {
	t.false(lib.isStaticRequire(utils.getExpression(`'foo'`)));
	t.false(lib.isStaticRequire(utils.getExpression(`42`)));
	t.false(lib.isStaticRequire(utils.getExpression(`a.b`)));
	t.false(lib.isStaticRequire(utils.getExpression(`foo`)));
});

test('should return false if node is a CallExpression without an Identifier as the callee', t => {
	t.false(lib.isStaticRequire(utils.getExpression(`require.a('lodash')`)));
	t.false(lib.isStaticRequire(utils.getExpression(`a.require('lodash')`)));
	t.false(lib.isStaticRequire(utils.getExpression(`require()('lodash')`)));
	t.false(lib.isStaticRequire(utils.getExpression(`(a + b)('lodash')`)));
});

test('should return false if node is a CallExpression with an Identifier not named `require`', t => {
	t.false(lib.isStaticRequire(utils.getExpression(`foo('lodash')`)));
	t.false(lib.isStaticRequire(utils.getExpression(`bar('lodash')`)));
});

test('should return false if node is a CallExpression with more or less than 1 argument', t => {
	t.false(lib.isStaticRequire(utils.getExpression(`require()`)));
	t.false(lib.isStaticRequire(utils.getExpression(`require('lodash', 'underscore')`)));
	t.false(lib.isStaticRequire(utils.getExpression(`require('lodash', 'underscore', 'async')`)));
});

test('should return false if node is a CallExpression with an argument that is not a Literal string', t => {
	t.false(lib.isStaticRequire(utils.getExpression(`require(['lodash'])`)));
	t.false(lib.isStaticRequire(utils.getExpression(`require(3)`)));
	t.false(lib.isStaticRequire(utils.getExpression(`require(a)`)));
	t.false(lib.isStaticRequire(utils.getExpression(`require(a + b)`)));
});

test('should return true if node is a CallExpression on `require` with one string Literal argument', t => {
	t.true(lib.isStaticRequire(utils.getExpression(`require('lodash')`)));
	t.true(lib.isStaticRequire(utils.getExpression(`require('async')`)));
	t.true(lib.isStaticRequire(utils.getExpression(`require('./')`)));
	t.true(lib.isStaticRequire(utils.getExpression(`require('@cycle/dom')`)));
	t.true(lib.isStaticRequire(utils.getExpression(`require('../path/to/over/there')`)));
});
