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
	t.true(lib.containsIdentifier('foo', utils.statement(`{const {foo: baz} = bar; foo;}`)));

	t.false(lib.containsIdentifier('baz', utils.statement(`{foo; bar;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const foo = 2;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const foo = 2; foo;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const bar = 3, foo = 2; foo;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{foo; const foo = 2;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const {foo} = bar; foo;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const {baz: foo} = bar; foo;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const [foo] = bar; foo;}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`{const {...foo} = bar; foo;}`)));
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
	t.true(lib.containsIdentifier('foo', utils.expression('tag`${foo} ${bar} ${baz}`')));
	t.true(lib.containsIdentifier('foo', utils.expression('foo`bar`')));

	t.false(lib.containsIdentifier('foo', utils.expression('`foo`')));
	t.false(lib.containsIdentifier('foo', utils.expression('`foo bar`')));
	t.false(lib.containsIdentifier('foo', utils.expression('`foo bar ${baz}`')));
	t.false(lib.containsIdentifier('foo', utils.expression('bar`baz`')));
	/* eslint-enable no-template-curly-in-string */
});

test('if node is in an object', t => {
	t.true(lib.containsIdentifier('foo', utils.expression('a = { b: foo }')));
	t.true(lib.containsIdentifier('foo', utils.expression('a = { foo }')));
	t.true(lib.containsIdentifier('foo', utils.expression('a = { "b": foo }')));
	t.true(lib.containsIdentifier('foo', utils.expression('a = { "bar": 2, [foo]: b }')));
	t.true(lib.containsIdentifier('foo', utils.expression('a = { ...foo, bar }')));
	t.true(lib.containsIdentifier('foo', utils.expression('a = { ...baz = foo, bar }')));

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
	t.true(lib.containsIdentifier('foo', utils.statement('const {...bar} = foo;')));

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
	t.false(lib.containsIdentifier('foo', utils.statement('const {...foo} = bar;')));
});

test('if node is in an assignment', t => {
	t.true(lib.containsIdentifier('foo', utils.statement('foo = bar;')));
	t.true(lib.containsIdentifier('foo', utils.statement('bar = foo;')));
	t.true(lib.containsIdentifier('foo', utils.statement('[foo.baz] = bar;')));
	t.true(lib.containsIdentifier('foo', utils.statement('[baz.baz, foo.bar] = bar;')));

	t.false(lib.containsIdentifier('foo', utils.statement('bar = baz;')));
	t.false(lib.containsIdentifier('foo', utils.statement('[baz.foo] = bar;')));
	t.false(lib.containsIdentifier('foo', utils.statement('[baz.other] = bar;')));
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
	t.false(lib.containsIdentifier('foo', utils.statement('function bar(...foo) { foo }')));
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
	t.true(lib.containsIdentifier('foo', utils.expression(`bar(baz, ...foo)`)));

	t.false(lib.containsIdentifier('foo', utils.expression(`bar()`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`bar.baz()`)));
	t.false(lib.containsIdentifier('foo', utils.expression(`bar.foo()`)));
});

test('if node is a NewExpression', t => {
	t.true(lib.containsIdentifier('foo', utils.expression(`new foo()`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`new Bar(foo)`)));
	t.true(lib.containsIdentifier('foo', utils.expression(`new Bar(baz, foo, bar)`)));

	t.false(lib.containsIdentifier('foo', utils.expression(`new Bar(baz, bar)`)));
});

test('if node is a ForStatement', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`for(var i = 0; i < foo.length; i++) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(foo = 0; i < bar.length; i++) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(i = 0; i < bar.length; foo++) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(i = 0; i < bar.length; i++, foo++) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(var i = 0; i < bar.length; i++) { foo }`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`for(var i = 0; i < bar.length; i++) {}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`for(var foo = 0; foo < bar.length; i++) {}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`for(let foo = 0; foo < bar.length; i++) {}`)));
});

test('if node is a ForInStatement', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`for(let i in foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(i in foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(let i in bar) { foo }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(foo in bar) {}`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`for(let i in bar) { baz }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`for(let foo in bar) {}`)));
});

test('if node is a ForOfStatement', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`for(let i of foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(i of foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(let i of bar) { foo }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`for(foo of bar) {}`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`for(let i of bar) { baz }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`for(let foo of bar) {}`)));
});

test('if node is a loop control flow statement', t => {
	t.false(lib.containsIdentifier('foo', utils.statement(`for(i of bar) { break; }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`foo: for(i of bar) { break foo; }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`for(i of bar) { continue; }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`foo: for(i of bar) { continue foo; }`)));
});

test('if node is a WhileStatement', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`while (foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`while (bar) { foo }`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`while (bar) { baz }`)));
});

test('if node is a DoWhileStatement', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`do {} while (foo)`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`do { foo } while (bar)`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`do { baz } while (bar)`)));
});

test('if node is a ThrowStatement', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`throw foo`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`throw bar`)));
});

test('if node is a YieldExpression', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`function *a() { yield foo; }`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`function *a() { yield bar; }`)));
});

test('if node is an await expression', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`async function a() { await foo; }`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`async function a() { await bar; }`)));
});

test('if node is a try/catch', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`try { foo } catch(e) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`try {} catch(e) { foo }`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`try { bar } catch(e) { baz }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`try { bar } catch(foo) { foo }`)));
});

test('if node is a switch case', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`switch (foo) {}`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`switch (bar) { case foo: break }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`switch (bar) { case baz: foo; break }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`switch (bar) { case 42: case baz: foo; break }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`switch (bar) { default: foo }`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`switch (bar) { case baz: break; case 42: other; break; default: another; break;}`)));
});

test('if node is a or in a class', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`class Bar { baz() { foo } }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`class Bar { static baz() { foo } }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`class Bar extends foo { }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`var a = class extends foo { }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`var a = class { bar() { foo } }`)));
	t.true(lib.containsIdentifier('foo', utils.statement(`var a = class { bar() { super(foo) } }`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`class foo {}`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`class Bar { foo() { bar } }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`class Bar { static foo() { bar } }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`class foo extends foo { }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`class Bar extends Baz { }`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`var a = class { bar() { baz } }`)));
});

test('if node is a LabeledStatement', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`bar: foo`)));

	t.false(lib.containsIdentifier('foo', utils.statement(`foo: bar`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`bar: baz`)));
});

test('if node is a DebuggerStatement', t => {
	t.false(lib.containsIdentifier('foo', utils.statement(`debugger;`)));
});

test('if node is an EmptyStatement', t => {
	t.false(lib.containsIdentifier('foo', utils.statement(`;;;`)));
});

test('if node is with import statement', t => {
	t.true(lib.containsIdentifier('foo', utils.program(`import 'foo'; foo`)));
	t.true(lib.containsIdentifier('foo', utils.program(`import bar from 'foo'; foo`)));
	t.true(lib.containsIdentifier('foo', utils.program(`import * as bar from 'foo'; foo`)));
	t.true(lib.containsIdentifier('foo', utils.program(`import {foo as bar} from 'foo'; foo`)));
	t.true(lib.containsIdentifier('foo', utils.program(`import baz, {foo as bar} from 'foo'; foo`)));

	t.false(lib.containsIdentifier('foo', utils.program(`import foo from 'foo'; foo`)));
	t.false(lib.containsIdentifier('foo', utils.program(`import * as foo from 'foo'; foo`)));
	t.false(lib.containsIdentifier('foo', utils.program(`import {foo} from 'foo'; foo`)));
	t.false(lib.containsIdentifier('foo', utils.program(`import bar, {foo} from 'foo'; foo`)));
	t.false(lib.containsIdentifier('foo', utils.program(`import {bar as foo} from 'foo'; foo`)));
});

test('if node is in export statement', t => {
	t.true(lib.containsIdentifier('foo', utils.statement(`export default foo`)));
	t.true(lib.containsIdentifier('foo', utils.program(`export let foo; foo`)));

	// t.false(lib.containsIdentifier('foo', utils.statement(`export foo from 'foo'`)));
	t.false(lib.containsIdentifier('foo', utils.statement(`export {bar} from 'foo'`)));
	t.false(lib.containsIdentifier('foo', utils.program(`export let bar; bar`)));
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
