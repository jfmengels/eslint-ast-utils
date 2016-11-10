'use strict';

const containsIdentifier = require('./lib/contains-identifier');

module.exports = {
	computeStaticExpression: require('./lib/compute-static-expression'),
	containsIdentifier: containsIdentifier.containsIdentifier,
	getPropertyName: require('./lib/get-property-name'),
	getRequireSource: require('./lib/get-require-source'),
	isPromise: require('./lib/is-promise'),
	isStaticRequire: require('./lib/is-static-require'),
	someContainIdentifier: containsIdentifier.someContainIdentifier
};
