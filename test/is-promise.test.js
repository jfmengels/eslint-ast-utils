import test from 'ava';
import lib from '../';
import babel from './helpers/babel';
import espree from './helpers/espree';

[espree, babel].forEach(({name, utils}) => {
	test(`(${name}) should return false if node is falsy or not a node`, t => {
		t.false(lib.isPromise(null));
		t.false(lib.isPromise(undefined));
		t.false(lib.isPromise({}));
		t.false(lib.isPromise('foo'));
	});

	test(`(${name}) should return true if node is call expression which calls '.then()'`, t => {
		t.true(lib.isPromise(utils.expression(`foo.then(fn)`)));
		t.true(lib.isPromise(utils.expression(`foo().then(fn)`)));
		t.true(lib.isPromise(utils.expression(`foo['then'](fn)`)));
		t.true(lib.isPromise(utils.expression(`foo['th' + 'en'](fn)`)));

		t.false(lib.isPromise(utils.expression(`foo().bar(fn)`)));
		t.false(lib.isPromise(utils.expression(`then(fn)`)));
		t.false(lib.isPromise(utils.expression(`foo['bar'](fn)`)));
		t.false(lib.isPromise(utils.expression(`foo[0](fn)`)));
	});

	test(`(${name}) should return true if node is call expression which calls '.catch()'`, t => {
		t.true(lib.isPromise(utils.expression(`foo.catch(fn)`)));
		t.true(lib.isPromise(utils.expression(`foo().catch(fn)`)));
		t.true(lib.isPromise(utils.expression(`foo['catch'](fn)`)));
	});

	test(`(${name}) should return false when accessing a property of a Promise`, t => {
		t.false(lib.isPromise(utils.expression(`foo.then(fn).foo`)));
		t.false(lib.isPromise(utils.expression(`foo.catch(fn).foo`)));
	});

	test(`(${name}) should return false when calling a property of a Promise`, t => {
		t.false(lib.isPromise(utils.expression(`foo.then(fn).map(fn)`)));
		t.false(lib.isPromise(utils.expression(`foo.catch(fn).map(fn)`)));
	});

	test(`(${name}) should return true when expression is a call to 'Promise.{resolve|reject|race|all}()`, t => {
		t.true(lib.isPromise(utils.expression(`Promise.resolve(fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.resolve(fn).then(fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.resolve(fn).catch(fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.reject(fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.race(fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.all(fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise['resolve'](fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise['reject'](fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise['race'](fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise['all'](fn)`)));

		t.false(lib.isPromise(utils.expression(`bar.resolve(fn)`)));
		t.false(lib.isPromise(utils.expression(`bar.reject(fn)`)));
		t.false(lib.isPromise(utils.expression(`bar.race(fn)`)));
		t.false(lib.isPromise(utils.expression(`bar.all(fn)`)));
		t.false(lib.isPromise(utils.expression(`foo.Promise.resolve(fn)`)));
		t.false(lib.isPromise(utils.expression(`Promise.resolve(fn).map(fn)`)));
	});

	test(`(${name}) should return false when expression is a call to a known non-Promise returning method of 'Promise`, t => {
		t.false(lib.isPromise(utils.expression(`Promise.is(fn)`)));
		t.false(lib.isPromise(utils.expression(`Promise.cancel(fn)`)));
		t.false(lib.isPromise(utils.expression(`Promise.promisify(fn)`)));
		t.false(lib.isPromise(utils.expression(`Promise.promisifyAll(obj)`)));
	});

	// Mostly Bluebird methods
	test(`(${name}) should return true when expression is a call to 'Promise.{anything}() except exceptions`, t => {
		t.true(lib.isPromise(utils.expression(`Promise.map(input, fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.filter(input, fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.reduce(input, fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.each(input, fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.mapSeries(input, fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.filter(input, fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.fromCallback(fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.fromNode(fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise.using(fn)`)));
		t.true(lib.isPromise(utils.expression(`Promise['map'](fn)`)));
	});

	test(`(${name}) should return true when calling 'new Promise(fn)'`, t => {
		t.true(lib.isPromise(utils.expression(`new Promise(fn);`)));
		t.true(lib.isPromise(utils.expression(`new Promise(fn).then();`)));

		t.false(lib.isPromise(utils.expression(`Promise(fn)`)));
		t.false(lib.isPromise(utils.expression(`new Promise(fn).map(fn)`)));
		t.false(lib.isPromise(utils.expression(`new Foo(fn)`)));
		t.false(lib.isPromise(utils.expression(`new Foo.bar(fn)`)));
		t.false(lib.isPromise(utils.expression(`new Promise.bar(fn)`)));
		t.false(lib.isPromise(utils.expression(`new Promise.resolve(fn)`)));
		t.false(lib.isPromise(utils.expression(`new Foo.resolve(fn)`)));
	});
});
