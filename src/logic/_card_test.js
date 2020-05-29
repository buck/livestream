// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("../util/assert");
const Card = require("./card");

describe("Card", function() {

	it("has a rank", function() {
		const card = new Card("3", "C");
		assert.equal(card.rank, "3");
	});

	it("has a suit", function() {
		const card = new Card("3", "C");
		assert.equal(card.suit, "C");
	});

	it("converts to string", function() {
		const card = new Card("3", "C");
		assert.equal(card.toString(), "3C");
	});

});