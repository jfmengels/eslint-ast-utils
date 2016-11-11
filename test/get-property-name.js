import test from 'ava';
import lib from '../';
import babel from './helpers/babel';
import espree from './helpers/espree';

[espree, babel].forEach(({name, utils}) => {
	test(`(${name}) should return undefined if node is not a MemberExpression`, t => {
		t.true(undefined === lib.getPropertyName(null));
		t.true(undefined === lib.getPropertyName(utils.expression(`null`)));
		t.true(undefined === lib.getPropertyName(utils.expression(`42`)));
		t.true(undefined === lib.getPropertyName(utils.expression('`42`')));
		t.true(undefined === lib.getPropertyName(utils.expression('foo')));
		t.true(undefined === lib.getPropertyName(utils.expression('foo()')));
		t.true(undefined === lib.getPropertyName(utils.expression('foo.bar()')));
	});

	test(`(${name}) should return the name of the property if node is non-computed and property is an Identifier`, t => {
		t.true(lib.getPropertyName(utils.expression(`foo.bar`)) === 'bar');
		t.true(lib.getPropertyName(utils.expression(`foo.bar.baz`)) === 'baz');
		t.true(lib.getPropertyName(utils.expression(`foo().bar`)) === 'bar');
		t.true(lib.getPropertyName(utils.expression(`foo().bar`)) === 'bar');
		t.true(lib.getPropertyName(utils.expression(`foo.null`)) === 'null');
		t.true(lib.getPropertyName(utils.expression(`foo.undefined`)) === 'undefined');
	});

	test(`(${name}) should return the value of the property if it is an Literal`, t => {
		t.true(lib.getPropertyName(utils.expression(`foo['bar']`)) === 'bar');
		t.true(lib.getPropertyName(utils.expression(`foo.bar['baz']`)) === 'baz');
		t.true(lib.getPropertyName(utils.expression(`foo()['bar']`)) === 'bar');
		t.true(lib.getPropertyName(utils.expression(`foo[null]`)) === null);
		t.true(lib.getPropertyName(utils.expression(`foo[undefined]`)) === undefined);
	});

	test(`(${name}) should return the index as a number of the property if it is a number`, t => {
		t.true(lib.getPropertyName(utils.expression(`foo[0]`)) === 0);
	});

	test(`(${name}) should return undefined if the property is an expression`, t => {
		t.true(undefined === lib.getPropertyName(utils.expression(`foo[bar]`)));
		t.true(undefined === lib.getPropertyName(utils.expression(`foo[bar()]`)));
		t.true(undefined === lib.getPropertyName(utils.expression(`foo[bar + baz]`)));
		t.true(undefined === lib.getPropertyName(utils.expression(`foo[0 + 0]`)));
	});
});
