'use strict';

const espree = require('espree');

function program(code) {
	return espree.parse(code, {
		sourceType: 'module',
		ecmaVersion: 8,
		ecmaFeatures: {
			jsx: true,
			experimentalObjectRestSpread: true
		}
	});
}

function statement(code) {
	return program(code).body[0];
}

function expression(code) {
	return statement(code).expression;
}

module.exports = {
	expression,
	program,
	statement
};
