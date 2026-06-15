const fs = require("fs");
const assert = require('assert');
const { transform } = require("@babel/core");
const plugin = require("../src/index");

function normalize(str) {
	return str.replace(/\r\n/g, '\n').trim();
}

function test(title, options = {}) {
	it(title, function () {
		const file = 'tests/case/' + title;
		const fileIn = file + '.js';
		const fileOut = file + '.out.js';
		const inputCode = fs.readFileSync(fileIn, 'utf8');
		const { code } = transform(inputCode, {
			filename: fileIn,
			plugins: [[plugin, options]]
		});
		assert.strictEqual(
			normalize(code),
			normalize(fs.readFileSync(fileOut, 'utf8'))
		);
	});
}

describe('babel-plugin-mark-fields', function () {
	test('basic');
	test('initializer');
	test('static-skip');
	test('private-skip');
	test('computed');
	test('named-expr');
	test('anonymous');
	test('string-key');
	test('method-skip');
	test('no-fields');
	test('existing-static-block');
});
