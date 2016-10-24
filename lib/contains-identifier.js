'use strict';

function introduces(name, node) {
	if (!node) {
		return false;
	}
	switch (node.type) {
		case 'Identifier':
			return node.name === name;
		case 'FunctionDeclaration':
			return introduces(name, node.id) ||
				someIntroduce(name, node.params);
		case 'ArrowFunctionExpression':
		case 'FunctionExpression':
			return someIntroduce(name, node.params);
		case 'BlockStatement':
			return someIntroduce(name, node.body);
		case 'VariableDeclaration':
			return someIntroduce(name, node.declarations);
		case 'VariableDeclarator':
			return introduces(name, node.id);
		case 'ObjectPattern':
			return someIntroduce(name, node.properties);
		case 'ArrayPattern':
			return someIntroduce(name, node.elements);
		case 'Property':
			return introduces(name, node.value);
		case 'ForStatement':
			return introduces(name, node.init);
		default:
			return false;
	}
}

function someIntroduce(name, array) {
	return Array.isArray(array) && array.some(item => {
		return introduces(name, item);
	});
}

function containsIdentifier(name, node) { // eslint-disable-line complexity
	if (!node) {
		return false;
	}
	switch (node.type) {
		// Primitives
		case 'Identifier':
			return node.name === name;
		case 'Literal':
			return false;
		case 'ThisExpression':
			return false;

		// Objects / Arrays
		case 'ArrayExpression':
			return someContainsIdentifier(name, node.elements);
		case 'ObjectExpression':
			return someContainsIdentifier(name, node.properties);
		case 'ExperimentalSpreadProperty':
			return containsIdentifier(name, node.argument);
		case 'Property':
			return (node.computed && containsIdentifier(name, node.key)) ||
				containsIdentifier(name, node.value);

		// Expressions
		case 'TemplateLiteral':
			return someContainsIdentifier(name, node.expressions);
		case 'SequenceExpression':
			return someContainsIdentifier(name, node.expressions);
		case 'CallExpression':
			return containsIdentifier(name, node.callee) ||
				someContainsIdentifier(name, node.arguments);
		case 'MemberExpression':
			if (node.computed === false) {
				return containsIdentifier(name, node.object);
			}
			return containsIdentifier(name, node.property) ||
				containsIdentifier(name, node.object);
		case 'ConditionalExpression':
			return containsIdentifier(name, node.test) ||
				containsIdentifier(name, node.consequent) ||
				containsIdentifier(name, node.alternate);
		case 'BinaryExpression':
			return containsIdentifier(name, node.left) ||
				containsIdentifier(name, node.right);
		case 'LogicalExpression':
			return containsIdentifier(name, node.left) ||
				containsIdentifier(name, node.right);
		case 'AssignmentExpression':
			return containsIdentifier(name, node.left) ||
				containsIdentifier(name, node.right);
		case 'UpdateExpression':
			return containsIdentifier(name, node.argument);
		case 'UnaryExpression':
			return containsIdentifier(name, node.argument);
		case 'ArrowFunctionExpression':
			if (node.params.some(param => param.type !== 'Identifier' && containsIdentifier(name, param))) {
				return true;
			}
			return !introduces(name, node) && containsIdentifier(name, node.body);
		case 'FunctionExpression':
			if (node.params.some(param => param.type !== 'Identifier' && containsIdentifier(name, param))) {
				return true;
			}
			return !introduces(name, node) && containsIdentifier(name, node.body);

		// Statements / control flow
		case 'ExpressionStatement':
			return containsIdentifier(name, node.expression);
		case 'ReturnStatement':
			return containsIdentifier(name, node.argument);
		case 'IfStatement':
			return containsIdentifier(name, node.test) ||
				containsIdentifier(name, node.consequent) ||
				containsIdentifier(name, node.alternate);
		case 'ForOfStatement':
			return containsIdentifier(name, node.left) ||
				containsIdentifier(name, node.right) ||
				containsIdentifier(name, node.body);
		case 'ForInStatement':
			return containsIdentifier(name, node.left) ||
				containsIdentifier(name, node.right) ||
				containsIdentifier(name, node.body);
		case 'ForStatement':
			return !introduces(name, node) && (
				containsIdentifier(name, node.init) ||
				containsIdentifier(name, node.test) ||
				containsIdentifier(name, node.update) ||
				containsIdentifier(name, node.body)
			);
		case 'Program':
			return !introduces(name, node) && someContainsIdentifier(name, node.body);
		case 'BlockStatement':
			return !introduces(name, node) && someContainsIdentifier(name, node.body);

		// Assignment / Declaration
		case 'AssignmentPattern':
			return containsIdentifier(name, node.left) ||
				containsIdentifier(name, node.right);
		case 'VariableDeclarator':
			if (node.id.type !== 'Identifier') {
				return containsIdentifier(name, node.id) ||
					containsIdentifier(name, node.init);
			}
			return containsIdentifier(name, node.init);
		case 'ObjectPattern':
			return node.properties.some(prop =>
				prop.value.type !== 'Identifier' && containsIdentifier(name, prop.value)
			);
		case 'FunctionDeclaration':
			if (node.params.some(param => param.type !== 'Identifier' && containsIdentifier(name, param))) {
				return true;
			}
			return !introduces(name, node) && containsIdentifier(name, node.body);
		case 'ArrayPattern':
			return node.elements.some(item => {
				return item && item.type !== 'Identifier' && containsIdentifier(name, item);
			});
		case 'VariableDeclaration':
			return someContainsIdentifier(name, node.declarations);
		// JSX
		case 'JSXIdentifier':
			return node.name === name;
		case 'JSXElement':
			return containsIdentifier(name, node.openingElement) ||
				someContainsIdentifier(name, node.children);
		case 'JSXOpeningElement':
			return containsIdentifier(name, node.name) ||
				someContainsIdentifier(name, node.attributes);
		case 'JSXExpressionContainer':
			return containsIdentifier(name, node.expression);
		case 'JSXSpreadAttribute':
			return containsIdentifier(name, node.argument);
		case 'JSXAttribute':
			return containsIdentifier(name, node.value);

		default:
			console.log(node.type);
			return false;
	}
}

function someContainsIdentifier(name, array) {
	return Array.isArray(array) && array.some(item => {
		return containsIdentifier(name, item);
	});
}

module.exports = {
	containsIdentifier,
	someContainsIdentifier
};
