'use strict';

const containsIdentifier = require('./lib/contains-identifier');

module.exports = {
	containsIdentifier: containsIdentifier.containsIdentifier,
	getRequireSource: require('./lib/get-require-source'),
	isStaticRequire: require('./lib/is-static-require'),
	someContainIdentifier: containsIdentifier.someContainIdentifier
};
