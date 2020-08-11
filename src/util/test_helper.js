// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("./ensure");
const http = require("http");
const path = require("path");
const childProcess = require("child_process");

exports.requestAsync = async function({ port, url, method, headers, body = [] } = {}) {
	return await new Promise((resolve, reject) => {
		ensure.signature(arguments, [[ undefined, {
			port: [ Number, String ],
			url: [ undefined, String ],
			method: [ undefined, String ],
			headers: [ undefined, Object ],
			body: [ undefined, Array ],
		}]]);
		if (method === undefined && body.length !== 0) method = "POST";

		const request = http.request({ port, path: url, method, headers });
		body.forEach((chunk) => request.write(chunk));
		request.end();

		request.on("response", (response) => {
			let body = "";
			response.on("data", (chunk) => {
				body += chunk;
			});
			response.on("error", (err) => reject(err));
			response.on("end", () => {
				const headers = response.headers;
				delete headers.connection;
				delete headers["content-length"];
				delete headers.date;

				resolve({
					status: response.statusCode,
					headers: response.headers,
					body,
				});
			});
		});
	});
};

exports.runModuleAsync = function(cwd, modulePath, { args = [], failOnStderr = true } = {}) {
	return new Promise((resolve, reject) => {
		ensure.signature(arguments, [ String, String, [ undefined, {
			args: [ undefined, Array ],
			failOnStderr: [ undefined, Boolean ],
		}]], [ "cwd", "modulePath", "options" ]);

		const absolutePath = path.resolve(cwd, modulePath);
		const options = {
			stdio: "pipe",
		};
		const child = childProcess.fork(absolutePath, args, options);

		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (data) => {
			stdout += data;
		});
		child.stderr.on("data", (data) => {
			stderr += data;
		});

		child.on("exit", () => {
			if (failOnStderr && stderr !== "") {
				console.log(stderr);
				return reject(new Error("Runner failed"));
			}
			else {
				return resolve({ stdout, stderr });
			}
		});
	});
};