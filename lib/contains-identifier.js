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
		case 'Identifier':
		case 'JSXIdentifier':
			return node.name === name;
		case 'ThisExpression':
			return false;
		case 'MemberExpression': {
			if (node.computed === false) {
				return containsIdentifier(name, node.object);
			}
			return containsIdentifier(name, node.property) ||
				containsIdentifier(name, node.object);
		}
		case 'ExpressionStatement':
		case 'JSXExpressionContainer':
			return containsIdentifier(name, node.expression);
		case 'ConditionalExpression':
		case 'IfStatement':
			return containsIdentifier(name, node.test) ||
				containsIdentifier(name, node.consequent) ||
				containsIdentifier(name, node.alternate);
		case 'BinaryExpression':
		case 'LogicalExpression':
		case 'AssignmentExpression':
		case 'AssignmentPattern':
			return containsIdentifier(name, node.left) ||
				containsIdentifier(name, node.right);
		case 'ForOfStatement':
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
		case 'UpdateExpression':
		case 'JSXSpreadAttribute':
		case 'ReturnStatement':
		case 'ExperimentalSpreadProperty':
		case 'UnaryExpression':
			return containsIdentifier(name, node.argument);
		case 'Property':
			return (node.computed && containsIdentifier(name, node.key)) ||
				containsIdentifier(name, node.value);
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
		case 'ArrowFunctionExpression':
		case 'FunctionExpression':
			if (node.params.some(param => param.type !== 'Identifier' && containsIdentifier(name, param))) {
				return true;
			}
			return !introduces(name, node) && containsIdentifier(name, node.body);
		case 'ArrayPattern':
			return node.elements.some(item => {
				return item && item.type !== 'Identifier' && containsIdentifier(name, item);
			});
		case 'ArrayExpression':
			return someContainsIdentifier(name, node.elements);
		case 'ObjectExpression':
			return someContainsIdentifier(name, node.properties);
		case 'Program':
		case 'BlockStatement':
			return !introduces(name, node) && someContainsIdentifier(name, node.body);
		case 'VariableDeclaration':
			return someContainsIdentifier(name, node.declarations);
		case 'TemplateLiteral':
		case 'SequenceExpression':
			return someContainsIdentifier(name, node.expressions);
		case 'CallExpression':
			return containsIdentifier(name, node.callee) ||
				someContainsIdentifier(name, node.arguments);
		case 'JSXAttribute':
			return containsIdentifier(name, node.value);
		case 'JSXElement':
			return containsIdentifier(name, node.openingElement) ||
				someContainsIdentifier(name, node.children);
		case 'JSXOpeningElement':
			return containsIdentifier(name, node.name) ||
				someContainsIdentifier(name, node.attributes);
		default:
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
