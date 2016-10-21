'use strict';

const espree = require('espree');

function statement(code) {
	return espree.parse(code, {
		ecmaVersion: 8,
		ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true
    }
	}).body[0];
}

function expression(code) {
	return statement(code).expression;
}

module.exports = {
	expression,
	statement
};
