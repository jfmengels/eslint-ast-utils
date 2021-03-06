import test from 'ava';
import lib from '../';
import babel from './helpers/babel';
import espree from './helpers/espree';

[espree, babel].forEach(({name, utils}) => {
	test(`(${name}) should return false if nodes is nil`, t => {
		t.false(lib.someContainIdentifier('foo', null));
		t.false(lib.someContainIdentifier('foo', undefined));
	});

	test(`(${name}) should return false if nodes is not an array`, t => {
		t.false(lib.someContainIdentifier('foo', utils.expression(`foo`)));
	});

	test(`(${name}) should return false if name is not found in any of the nodes`, t => {
		t.false(lib.someContainIdentifier('other', [
			utils.expression(`foo`),
			utils.expression(`bar`),
			utils.expression(`baz`)
		]));
	});

	test(`(${name}) should return true if name is found in any of the nodes`, t => {
		t.true(lib.someContainIdentifier('foo', [
			utils.expression(`foo`)
		]));
		t.true(lib.someContainIdentifier('foo', [
			utils.expression(`foo`),
			utils.expression(`foo`)
		]));
		t.true(lib.someContainIdentifier('foo', [
			utils.expression(`foo`),
			utils.expression(`bar`),
			utils.expression(`baz`)
		]));
		t.true(lib.someContainIdentifier('foo', [
			utils.expression(`bar`),
			utils.expression(`foo`),
			utils.expression(`baz`)
		]));
		t.true(lib.someContainIdentifier('foo', [
			utils.expression(`bar`),
			utils.expression(`baz`),
			utils.expression(`foo`)
		]));
	});
});
