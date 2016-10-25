'use strict';

const babel = require('babel-eslint');

function program(code) {
	return babel.parse(code);
}

function statement(code) {
	return program(code).body[0];
}

function expression(code) {
	return statement(code).expression;
}

module.exports = {
	name: 'babel',
	utils: {
		expression,
		program,
		statement
	}
};
