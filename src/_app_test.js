// Copyright Titanium I.T. LLC.
"use strict";

const td = require("testdouble");
const CommandLine = require("./infrastructure/command_line");
const rot13 = require("./logic/rot13");
const App = require("./app");

describe("App", function() {

	it("reads command-line argument, transform it with ROT-13, and write result", function() {
		const input = "my input";
		const expectedOutput = rot13.transform(input);

		const { commandLine, app } = setup([ input ]);
		app.run();
		assertOutput(commandLine, expectedOutput);
	});

	it("writes usage to command-line when no argument provided", function() {
		const { commandLine, app } = setup([]);
		app.run();
		assertOutput(commandLine, "Usage: run text_to_transform");
	});

	it("complains when too many command-line arguments provided", function() {
		const { commandLine, app } = setup([ "a", "b" ]);
		app.run();
		assertOutput(commandLine, "too many arguments");
	});

});


function setup(args) {
	const commandLine = new (td.constructor(CommandLine));
	const app = App.create(commandLine);

	td.when(commandLine.args()).thenReturn(args);

	return { commandLine, app };
}

function assertOutput(commandLine, expectedOutput) {
	td.verify(commandLine.writeOutput(expectedOutput));
}