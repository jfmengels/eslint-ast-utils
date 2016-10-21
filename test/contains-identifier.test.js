import test from 'ava';
import espree from 'espree';
import lib from '../';
import utils from './helpers/utils';

test('should return false if node is nil', t => {
	t.false(lib.containsIdentifier('foo', null));
	t.false(lib.containsIdentifier('foo', undefined));
});

test('should return false if node is of an unknown type', t => {
	t.false(lib.containsIdentifier('foo', {
		type: 'UNKNOWN_TYPE_FOO_BAR'
	}));
});

test('if node is an Identifier', t => {
	t.true(lib.containsIdentifier('foo', utils.expression(`foo`)));

	t.false(lib.containsIdentifier('foo', utils.expression(`bar`)));
});

test('if node is a Literal', t => {
	t.false(lib.containsIdentifier('foo', utils.expression(`'bar'`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`3`)));
});

test('if node is a BlockStatement', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`{foo; bar;}`)));
	t.true(lib.containsIdentifier('bar', utils.statement(`{foo; bar;}`)));

	t.false(lib.containsIdentifier('baz', utils.statement(`{foo; bar;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const foo = 2;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const foo = 2; foo;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const bar = 3, foo = 2; foo;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{foo; const foo = 2;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const {foo} = bar; foo;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const [foo] = bar; foo;}`)));
});

test('if node is a Program', t => {
	const program = espree.parse(`foo`);
	t.true(lib.containsIdentifier('foo', program));

	t.false(lib.containsIdentifier('bar', program));
});

test('if node is a MemberExpression', t => {
	t.true(lib.containsIdentifier('foo', utils.expression(`foo.bar`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`foo[bar]`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`foo['bar']`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`bar[foo]`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`this[foo]`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`foo.this.bar`)));

	t.false(lib.containsIdentifier('foo', utils.expression(`bar.baz`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`bar.foo`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`bar['foo']`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`this.foo`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`this['foo']`)));
});

test('if node is an expression', t => {
	t.true(lib.containsIdentifier('foo', utils.statement('foo')));
	t.true(lib.containsIdentifier('foo', utils.statement('+foo')));
	t.true(lib.containsIdentifier('foo', utils.statement('-foo')));
	t.true(lib.containsIdentifier('foo', utils.statement('++foo')));
	t.true(lib.containsIdentifier('foo', utils.statement('foo++')));

	t.false(lib.containsIdentifier('foo', utils.statement('bar')));
	t.false(lib.containsIdentifier('foo', utils.statement('+bar')));
	t.false(lib.containsIdentifier('foo', utils.statement('-bar')));
	t.false(lib.containsIdentifier('foo', utils.statement('++bar')));
	t.false(lib.containsIdentifier('foo', utils.statement('bar++')));
});

test('if node is a complex expression', t => {
	t.true(lib.containsIdentifier('foo', utils.statement('foo + bar')));
	t.true(lib.containsIdentifier('foo', utils.statement('foo - bar')));
	t.true(lib.containsIdentifier('foo', utils.statement('foo || bar')));
	t.true(lib.containsIdentifier('foo', utils.statement('foo && bar')));
	t.true(lib.containsIdentifier('foo', utils.statement('foo, bar')));

	t.false(lib.containsIdentifier('foo', utils.statement('bar + baz')));
	t.false(lib.containsIdentifier('foo', utils.statement('bar - baz')));
	t.false(lib.containsIdentifier('foo', utils.statement('bar || baz')));
	t.false(lib.containsIdentifier('foo', utils.statement('bar && baz')));
	t.false(lib.containsIdentifier('foo', utils.statement('bar, baz')));
});

test('if node is a ConditionalExpression', t => {
	const expression = utils.expression(`foo ? bar : baz`);

	t.true(lib.containsIdentifier('foo', expression));
	t.true(lib.containsIdentifier('bar', expression));
	t.true(lib.containsIdentifier('baz', expression));

	t.false(lib.containsIdentifier('other', expression));
});

test('if node is an IfStatement', t => {
	// Without an alternate
	let statement = utils.statement(`if (foo) { bar }`);
	t.true(lib.containsIdentifier('foo', statement));
	t.true(lib.containsIdentifier('bar', statement));

	t.false(lib.containsIdentifier('baz', statement));

	// Without an alternate and without braces
	statement = utils.statement(`if (foo) bar`);
	t.true(lib.containsIdentifier('foo', statement));
	t.true(lib.containsIdentifier('bar', statement));

	t.false(lib.containsIdentifier('baz', statement));

	// With an alternate
	statement = utils.statement(`if (foo) { bar } else { baz }`);
	t.true(lib.containsIdentifier('foo', statement));
	t.true(lib.containsIdentifier('bar', statement));
	t.true(lib.containsIdentifier('baz', statement));

	t.false(lib.containsIdentifier('other', statement));

	// With an alternate but without braces
	statement = utils.statement(`
		if (foo)
		  bar
		else
		  baz`);
	t.true(lib.containsIdentifier('foo', statement));
	t.true(lib.containsIdentifier('bar', statement));
	t.true(lib.containsIdentifier('baz', statement));

	t.false(lib.containsIdentifier('other', statement));
});

test('if node is a TemplateLiteral', t => {
	/* eslint-disable no-template-curly-in-string */
	t.true(lib.containsIdentifier('foo', utils.expression('`${foo}`')));
	t.true(lib.containsIdentifier('foo', utils.expression('`${foo + bar}`')));
	t.true(lib.containsIdentifier('foo', utils.expression('`${foo} ${bar} ${baz}`')));
	t.true(lib.containsIdentifier('bar', utils.expression('`${foo} ${bar} ${baz}`')));
	t.true(lib.containsIdentifier('baz', utils.expression('`${foo} ${bar} ${baz}`')));

	t.false(lib.containsIdentifier('foo', utils.expression('`foo`')));
	t.false(lib.containsIdentifier('foo', utils.expression('`foo bar`')));
	t.false(lib.containsIdentifier('foo', utils.expression('`foo bar ${baz}`')));
	/* eslint-enable no-template-curly-in-string */
});

test('if node is in an object', t => {
	t.true(lib.containsIdentifier('foo', utils.expression('a = { b: foo }')));
	t.true(lib.containsIdentifier('foo', utils.expression('a = { foo }')));
	t.true(lib.containsIdentifier('foo', utils.expression('a = { "b": foo }')));
	t.true(lib.containsIdentifier('foo', utils.expression('a = { "bar": 2, [foo]: b }')));
	t.true(lib.containsIdentifier('foo', utils.expression('a = { ...foo, bar }')));

	t.false(lib.containsIdentifier('foo', utils.expression('a = { foo: b }')));
	t.false(lib.containsIdentifier('foo', utils.expression('a = { "foo": b }')));
	t.false(lib.containsIdentifier('foo', utils.expression('a = { foo() {} }')));
	t.false(lib.containsIdentifier('foo', utils.expression('a = { ...bar, baz }')));
});

test('if node is in an array', t => {
	t.true(lib.containsIdentifier('foo', utils.expression('[1, 2, foo]')));
	t.true(lib.containsIdentifier('foo', utils.expression('[,, foo]')));
	t.true(lib.containsIdentifier('foo', utils.expression('[, [], [foo]]')));

	t.false(lib.containsIdentifier('foo', utils.expression('[]')));
	t.false(lib.containsIdentifier('foo', utils.expression('[1, 2, 3]')));
});

test('if node is a VariableDeclaration', t => {
	t.true(lib.containsIdentifier('foo', utils.statement('var bar = foo;')));
	t.true(lib.containsIdentifier('foo', utils.statement('let bar = foo;')));
	t.true(lib.containsIdentifier('foo', utils.statement('const bar = foo;')));
	t.true(lib.containsIdentifier('foo', utils.statement('const baz = 42, bar = foo;')));
	t.true(lib.containsIdentifier('foo', utils.statement('const bar = foo, baz = 42;')));
	t.true(lib.containsIdentifier('foo', utils.statement('const baz = 42, bar = foo;')));
	t.true(lib.containsIdentifier('foo', utils.statement('const {bar} = foo;')));
	t.true(lib.containsIdentifier('foo', utils.statement('const {bar = foo} = baz;')));
	t.true(lib.containsIdentifier('foo', utils.statement('const {a: {bar = foo}} = baz;')));
	t.true(lib.containsIdentifier('foo', utils.statement('const [bar = foo] = baz;')));
	t.true(lib.containsIdentifier('foo', utils.statement('const [[bar = foo]] = baz;')));

	t.false(lib.containsIdentifier('foo', utils.statement('var foo;')));
	t.false(lib.containsIdentifier('foo', utils.statement('let foo;')));
	t.false(lib.containsIdentifier('foo', utils.statement('var foo, bar;')));
	t.false(lib.containsIdentifier('foo', utils.statement('var bar, baz;')));
	t.false(lib.containsIdentifier('foo', utils.statement('const bar = baz;')));
	t.false(lib.containsIdentifier('foo', utils.statement('const foo = bar;')));
	t.false(lib.containsIdentifier('foo', utils.statement('const [foo] = bar;')));
	t.false(lib.containsIdentifier('foo', utils.statement('const [,,foo] = bar;')));
	t.false(lib.containsIdentifier('foo', utils.statement('const {foo} = bar;')));
	t.false(lib.containsIdentifier('foo', utils.statement('const {baz: foo} = bar;')));
	t.false(lib.containsIdentifier('foo', utils.statement('const {foo: baz} = bar;')));
});

test('if node is a or in a function', t => {
	t.true(lib.containsIdentifier('foo', utils.statement('function bar() { foo }')));
	t.true(lib.containsIdentifier('foo', utils.statement('function bar() { return foo }')));
	t.true(lib.containsIdentifier('foo', utils.statement('function bar(a, b = foo) {}')));
	t.true(lib.containsIdentifier('foo', utils.statement('var a = function(a, b = foo) {}')));
	t.true(lib.containsIdentifier('foo', utils.statement('var a = (a, b = foo) => {}')));
	t.true(lib.containsIdentifier('foo', utils.statement('var a = () => foo')));
	t.true(lib.containsIdentifier('foo', utils.statement('function bar(foo, b = foo) {}')));
	t.true(lib.containsIdentifier('foo', utils.statement('function bar(b = foo, foo) {}')));
	t.true(lib.containsIdentifier('foo', utils.statement('function bar({a = foo} = {}) {}')));
	t.true(lib.containsIdentifier('foo', utils.statement('function bar({a = foo} = {foo}) {}')));

	t.false(lib.containsIdentifier('foo', utils.statement('function bar() { baz }')));
	t.false(lib.containsIdentifier('foo', utils.statement('function bar(a, b, c) {}')));
	t.false(lib.containsIdentifier('foo', utils.statement('function foo() { foo }')));
	t.false(lib.containsIdentifier('foo', utils.statement('function bar(foo) { foo }')));
	t.false(lib.containsIdentifier('foo', utils.statement('function bar({foo}) { foo }')));
	t.false(lib.containsIdentifier('foo', utils.statement('function bar({a: foo}) { foo }')));
	t.false(lib.containsIdentifier('foo', utils.statement('function bar({a: {foo}}) { foo }')));
	t.false(lib.containsIdentifier('foo', utils.statement('function bar([, foo]) { foo }')));
	t.false(lib.containsIdentifier('foo', utils.statement('function bar([, [foo]]) { foo }')));
	t.false(lib.containsIdentifier('foo', utils.statement('var a = foo => foo')));
});

test('if node is a CallExpression', t => {
	t.true(lib.containsIdentifier('foo', utils.expression(`foo(bar)`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`foo.baz(bar)`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`bar(foo)`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`bar(baz, foo)`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`bar(baz, {foo})`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`bar(baz, [foo])`)));

	t.false(lib.containsIdentifier('foo', utils.expression(`bar()`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`bar.baz()`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`bar.foo()`)));
});

test('if node is a loop (ForStatement)', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`for(var i = 0; i < foo.length; i++) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(foo = 0; i < bar.length; i++) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(i = 0; i < bar.length; foo++) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(i = 0; i < bar.length; i++, foo++) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(var i = 0; i < bar.length; i++) { foo }`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`for(var i = 0; i < bar.length; i++) {}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`for(var foo = 0; foo < bar.length; i++) {}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`for(let foo = 0; foo < bar.length; i++) {}`)));
});

test('if node is a loop (ForInStatement)', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`for(let i in foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(i in foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(let i in bar) { foo }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(foo in bar) {}`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`for(let i in bar) { baz }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`for(let foo in bar) {}`)));
});

test('if node is a loop (ForOfStatement)', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`for(let i of foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(i of foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(let i of bar) { foo }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(foo of bar) {}`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`for(let i of bar) { baz }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`for(let foo of bar) {}`)));
});

test('if node is in JSX', t => {
	t.true(lib.containsIdentifier('foo', utils.expression(`<foo></foo>`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`<foo/>`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`<Elt>{foo}</Elt>`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`<Elt bar={foo}/>`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`<Elt {...foo}/>`)));

	t.false(lib.containsIdentifier('foo', utils.expression(`<bar></bar>`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`<bar/>`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`<bar>foo</bar>`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`<Elt bar={bar}/>`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`<Elt bar={this.foo}/>`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`<Elt {...bar}/>`)));
});
