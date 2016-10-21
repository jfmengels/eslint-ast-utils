# ast-utils [![Build Status](https://travis-ci.org/jfmengels/ast-utils.svg?branch=master)](https://travis-ci.org/jfmengels/ast-utils)

> Utility library to manipulate ASTs


## Install

```
$ npm install --save ast-utils
```

## Usage

```js
const astUtils = require('ast-utils');
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

## License

MIT © [Jeroen Engels](https://github.com/jfmengels)
