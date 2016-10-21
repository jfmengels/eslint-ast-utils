'use strict';

const get = require('lodash.get');

function getRequireSource(node) {
	return get(node, 'arguments.0.value');
}

module.exports = getRequireSource;
