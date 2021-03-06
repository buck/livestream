// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");

exports.transform = function(input) {
	ensure.signature(arguments, [ String ]);

	let result = "";
	for (let i = 0; i < input.length; i++) {
		let charCode = input.charCodeAt(i);
		result += transformLetter(charCode);
	}
	return result;
};

function transformLetter(charCode) {
	if (isBetween(charCode, "a", "m") || isBetween(charCode, "A", "M")) charCode += 13;
	else if (isBetween(charCode, "n", "z") || isBetween(charCode, "N", "Z")) charCode -= 13;
	return String.fromCharCode(charCode);
}

function isBetween(charCode, firstLetter, lastLetter) {
	return charCode >= codeFor(firstLetter) && charCode <= codeFor(lastLetter);
}

function codeFor(letter) {
	return letter.charCodeAt(0);
}

