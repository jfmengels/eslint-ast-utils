'use strict';

const getPropertyName = require('./get-property-name');

const prototypeMethods = ['then', 'catch'];
const staticMethods = ['resolve', 'reject', 'race', 'all'];

function containsThenOrCatch(node) {
	return Boolean(node) &&
		node.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		prototypeMethods.indexOf(getPropertyName(node.callee)) !== -1;
}

function isPromiseStaticMethod(node) {
	return Boolean(node) &&
		node.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		node.callee.object.type === 'Identifier' &&
		node.callee.object.name === 'Promise' &&
		staticMethods.indexOf(getPropertyName(node.callee)) !== -1;
}

function isNewPromise(node) {
	return Boolean(node) &&
		node.type === 'NewExpression' &&
		node.callee.type === 'Identifier' &&
		node.callee.name === 'Promise';
}

function isPromise(node) {
	return containsThenOrCatch(node) ||
		isPromiseStaticMethod(node) ||
		isNewPromise(node);
}

module.exports = isPromise;
