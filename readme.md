# ast-utils [![Build Status](https://travis-ci.org/jfmengels/ast-utils.svg?branch=master)](https://travis-ci.org/jfmengels/ast-utils)

> Utility library to manipulate ASTs


## Install

```
$ npm install --save ast-utils
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
```

Usage example (in the context of an ESLint rule):
```js
const astUtils = require('ast-utils');

function create(context) {
	return {
		CallExpression(node) {
			if (astUtils.isStaticRequire(node) && node.arguments[0].value === 'underscore') {
				context.report({
					node: node,
					message: 'Use `lodash` instead of `underscore`'
				});
			}
		}
	};
};
```

## License

MIT © [Jeroen Engels](https://github.com/jfmengels)
