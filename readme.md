# eslint-ast-utils [![Build Status](https://travis-ci.org/jfmengels/eslint-ast-utils.svg?branch=master)](https://travis-ci.org/jfmengels/eslint-ast-utils)

> Utility library to manipulate ASTs for ESLint projects


## Install

```
$ npm install --save eslint-ast-utils
```

## Usage

```js
const astUtils = require('eslint-ast-utils');
```


## API

### astUtils.isStaticRequire(node)

Checks whether `node` is a call to CommonJS's `require` function.

Returns `true` if and only if:
- node is a `CallExpression`
- `node`'s callee is an `Identifier` named `require`
- `node` has exactly 1 `Literal` argument whose value is a `string`

Example:
```js
require('lodash');
// => true
require(foo);
// => false
foo('lodash');
// => false
```

Usage example (in the context of an ESLint rule):
```js
function create(context) {
	return {
		CallExpression(node) {
			if (astUtils.isStaticRequire(node)) {
				context.report({
					node: node,
					message: 'Use import syntax rather than `require`'
				});
			}
		}
	};
}
```

### astUtils.getRequireSource(node)

Gets the source of a `require()` call. If `node` is not a `require` call (in the definition of [`isStaticRequire`](#astutilsisstaticrequirenode)), it will return `undefined`.

Example:
```js
require('lodash');
// => 'lodash'
require('./foo');
// => './foo'
```

Usage example (in the context of an ESLint rule):
```js
function create(context) {
	return {
		CallExpression(node) {
			if (astUtils.isStaticRequire(node) && astUtils.getRequireSource(node) === 'underscore') {
				context.report({
					node: node,
					message: 'Use `lodash` instead of `underscore`'
				});
			}
		}
	};
}
```

### astUtils.containsIdentifier(name, node)

Checks if there is a reference to a variable named `name` inside of `node`.

Returns true if and only if:
- There is an `Identifier` named `name` inside of `node`
- That `Identifier` is a variable (i.e. not a static property name for instance)
- That `Identifier` does not reference a different variable named `name` introduced in a sub-scope of `node`.

Example:
```js
foo(a);
// containsIdentifier('a', node) // => true
// containsIdentifier('b', node) // => true

function foo(fn) {
	return function(a) {
		return fn(a);
	};
}
// containsIdentifier('a', node) // => false
```

Usage example (in the context of an ESLint rule):
```js
function create(context) {
	return {
		FunctionDeclaration(node) {
			node.params.forEach(param => {
				if (param.type === 'Identifier' && !astUtils.containsIdentifier(param.name, node.body)) {
					context.report({
						node: node,
						message: `${name} is never used`
					});
				}
			});
		}
	};
}
```

### astUtils.someContainIdentifier(name, nodes)

Checks if there is a reference to a variable named `name` inside any node of the `nodes` array. Will return `false` if `nodes` is not an array.
This is a shorthand version of [`containsIdentifier`](#astutilscontainsidentifier) that works for arrays. The following are equivalent:

```js
[node1, node2, node3].some(node => astUtils.containsIdentifier('a', node));
// equivalent to
astUtils.someContainIdentifier('a', [node1, node2, node3]);
```

## License

MIT © [Jeroen Engels](https://github.com/jfmengels)
