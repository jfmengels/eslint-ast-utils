'use strict';

const espree = require('espree');

function getExpression(code) {
	return espree.parse(code).body[0].expression;
}

module.exports = {
	getExpression
};
