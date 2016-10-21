import test from 'ava';
import lib from '../';
import utils from './helpers/utils';

test('should return undefined if node is not a require call', t => {
	t.true(undefined === lib.getRequireSource(null));
	t.true(undefined === lib.getRequireSource(`42`));
	t.true(undefined === lib.getRequireSource('`42`'));
	t.true(undefined === lib.getRequireSource(`a('lodash')`));
	t.true(undefined === lib.getRequireSource(`require.a('lodash')`));
	t.true(undefined === lib.getRequireSource(`require(foo)`));
	t.true(undefined === lib.getRequireSource(`require(foo + bar)`));
	t.true(undefined === lib.getRequireSource(`require('lodash', 'underscore')`));
	t.true(undefined === lib.getRequireSource(`require(['lodash'])`));
	t.true(undefined === lib.getRequireSource(`require(42)`));
});

test('should return the value of the first argument if node is a proper require call', t => {
	t.true(lib.getRequireSource(utils.expression(`require('lodash')`)) === 'lodash');
	t.true(lib.getRequireSource(utils.expression(`require('async')`)) === 'async');
	t.true(lib.getRequireSource(utils.expression(`require('./')`)) === './');
	t.true(lib.getRequireSource(utils.expression(`require('@cycle/dom')`)) === '@cycle/dom');
	t.true(lib.getRequireSource(utils.expression(`require('../path/to/over/there')`)) === '../path/to/over/there');
});
