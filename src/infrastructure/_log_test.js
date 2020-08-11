// Copyright Titanium I.T. LLC.
"use strict";

// dependency_analysis: ./_log_test_output_runner
// dependency_analysis: ./_log_test_null_output_runner
const assert = require("../util/assert");
const Log = require("./log");
const CommandLine = require("./command_line");
const Clock = require("./clock");
const testHelper = require("../util/test_helper");

describe("Log", function() {

	it("writes to stdout", async function() {
		const { stdout } = await testHelper.runModuleAsync(__dirname, "./_log_test_output_runner");
		assert.match(stdout, / UTC {"alert":"info","output":"my output"}$/);
	});

	it("outputs current time and structured data", function() {
		const { log, stdout } = createLog();

		const data = {
			output: "my output",
		};
		const expectedData = {
			alert: "info",
			output: "my output",
		};
		log.info(data);
		assert.deepEqual(stdout, [ "Jan 1, 1970, 00:00:00 UTC " + JSON.stringify(expectedData) ]);
	});

	it("outputs full stack trace for errors", function() {
		const { log, stdout } = createLog();

		const data = {
			output: new Error("my error"),
		};
		log.info(data);
		assert.match(stdout[0], /^Jan 1, 1970, 00:00:00 UTC {"alert":"info","output":"Error: my error\\n    at /);
	});

	it("provides multiple alert levels", function() {
		const { log, output } = createLog();

		log.debug({});
		log.info({});
		log.monitor({});
		log.action({});
		log.emergency({});

		assert.deepEqual(output, [
			{ alert: "debug" },
			{ alert: "info" },
			{ alert: "monitor" },
			{ alert: "action" },
			{ alert: "emergency" },
		]);
	});

	it("can track output", function() {
		const { log } = createLog();
		const output = log.trackOutput();

		const data = {
			output: "my output"
		};
		const expectedOutput = {
			alert: "info",
			output: "my output",
		};

		log.info(data);
		assert.deepEqual(output, [ expectedOutput ]);
	});

	it("tracker strips stack traces from errors", function() {
		const { log, output } = createLog();

		const data = {
			output: new Error("my error"),
		};
		const expectedOutput = {
			alert: "info",
			output: "Error: my error",
		};

		log.info(data);
		assert.deepEqual(output, [ expectedOutput ]);
	});


	describe("Nullability", function() {

		it("doesn't write to stdout", async function() {
			const { stdout } = await testHelper.runModuleAsync(__dirname, "./_log_test_null_output_runner");
			assert.equal(stdout, "");
		});

	});

});


function createLog() {
	const commandLine = CommandLine.createNull();
	const stdout = commandLine.trackStdout();
	const clock = Clock.createNull({ now: 0 });
	const log = new Log(commandLine, clock);
	const output = log.trackOutput();
	return { log, stdout, output };
}
