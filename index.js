'use strict';

const containsIdentifier = require('./lib/contains-identifier');

module.exports = {
	containsIdentifier: containsIdentifier.containsIdentifier,
	getPropertyName: require('./lib/get-property-name'),
	getRequireSource: require('./lib/get-require-source'),
	isStaticRequire: require('./lib/is-static-require'),
	someContainIdentifier: containsIdentifier.someContainIdentifier
};
