import test from 'ava';
import lib from '../';
import babel from './helpers/babel';
import espree from './helpers/espree';

[espree, babel].forEach(({name, utils}) => {
	test(`(${name}) should return undefined if node is not a require call`, t => {
		t.true(undefined === lib.getRequireSource(null));
		t.true(undefined === lib.getRequireSource(utils.expression(`null`)));
		t.true(undefined === lib.getRequireSource(utils.expression(`42`)));
		t.true(undefined === lib.getRequireSource(utils.expression('`42`')));
		t.true(undefined === lib.getRequireSource(utils.expression(`a('lodash')`)));
		t.true(undefined === lib.getRequireSource(utils.expression(`require.a('lodash')`)));
		t.true(undefined === lib.getRequireSource(utils.expression(`require(foo)`)));
		t.true(undefined === lib.getRequireSource(utils.expression(`require(foo + bar)`)));
		t.true(undefined === lib.getRequireSource(utils.expression(`require('lodash', 'underscore')`)));
		t.true(undefined === lib.getRequireSource(utils.expression(`require(['lodash'])`)));
		t.true(undefined === lib.getRequireSource(utils.expression(`require(42)`)));
	});

	test(`(${name}) should return the value of the first argument if node is a proper require call`, t => {
		t.true(lib.getRequireSource(utils.expression(`require('lodash')`)) === 'lodash');
		t.true(lib.getRequireSource(utils.expression(`require('async')`)) === 'async');
		t.true(lib.getRequireSource(utils.expression(`require('./')`)) === './');
		t.true(lib.getRequireSource(utils.expression(`require('@cycle/dom')`)) === '@cycle/dom');
		t.true(lib.getRequireSource(utils.expression(`require('../path/to/over/there')`)) === '../path/to/over/there');
	});
});
