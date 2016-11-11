'use strict';

function getPropertyName(node) {
	if (node && node.type === 'MemberExpression') {
		if (node.property.type === 'Identifier' && node.computed === false) {
			return node.property.name;
		}
		if (node.property.type === 'Literal') {
			return node.property.value;
		}
	}

	return undefined;
}

module.exports = getPropertyName;
