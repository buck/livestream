// Copyright Titanium I.T. LLC.
"use strict";

const ensure = require("util/ensure");
const type = require("util/type");
const http = require("http");
const EventEmitter = require("events");
const HttpRequest = require("./http_request");
const Log = require("infrastructure/log");

const RESPONSE_TYPE = { status: Number, headers: Object, body: String };

/** Wrapper for HTTP server */
module.exports = class HttpServer {

	static create(log) {
		ensure.signature(arguments, [ Log ]);
		return new HttpServer(http, log);
	}

	static createNull() {
		ensure.signature(arguments, []);
		return new HttpServer(nullHttp, Log.createNull());
	}

	constructor(http, log) {
		this._http = http;
		this._log = log;
		this._server = null;
	}

	get isStarted() {
		return this._server !== null;
	}

	startAsync({ port, onRequestAsync }) {
		return new Promise((resolve, reject) => {
			ensure.signature(arguments, [{ port: Number, onRequestAsync: Function }]);
			if (this.isStarted) throw new Error("Can't start server because it's already running");

			this._onRequestAsync = onRequestAsync;
			this._server = this._http.createServer();
			this._server.on("error", (err) => {
				reject(new Error(`Couldn't start server due to error: ${err.message}`));
			});
			this._server.on("request", async (nodeRequest, nodeResponse) => {
				const { status, headers, body } = await handleRequestAsync(this._log, HttpRequest.create(nodeRequest), onRequestAsync);

				nodeResponse.statusCode = status;
				Object.entries(headers).forEach(([ name, value ]) => nodeResponse.setHeader(name, value));
				nodeResponse.end(body);
			});

			this._server.on("listening", () => {
				resolve();
			});
			this._server.listen(port);
		});
	}

	stopAsync() {
		return new Promise((resolve, reject) => {
			ensure.signature(arguments, []);
			if (!this.isStarted) throw new Error("Can't stop server because it isn't running");

			this._server.on("close", () => {
				this._server = null;
				resolve();
			});
			this._server.close();
		});
	}

	async simulateRequestAsync(httpRequest = HttpRequest.createNull()) {
		ensure.signature(arguments, [[ undefined, HttpRequest ]]);
		if (!this.isStarted) throw new Error("Can't simulate request because server isn't running");
		return await handleRequestAsync(this._log, httpRequest, this._onRequestAsync);
	}

};

async function handleRequestAsync(log, httpRequest, onRequestAsync) {
	try {
		const response = await onRequestAsync(httpRequest);
		const typeError = type.check(response, RESPONSE_TYPE);
		if (typeError !== null) {
			log.emergency({ message: "request handler returned invalid response", response });
			return internalServerError();
		}
		else {
			return response;
		}
	}
	catch (err) {
		log.emergency({ message: "request handler threw exception", error: err });
		return internalServerError();
	}
}

function internalServerError() {
	return {
		status: 500,
		headers: { "content-type": "text/plain; charset=utf-8" },
		body: "Internal Server Error",
	};
}


const nullHttp = {
	createServer() {
		return new NullNodeServer();
	}
};

class NullNodeServer extends EventEmitter {
	listen() {
		setImmediate(() => this.emit("listening"));
	}
	close() {
		setImmediate(() => this.emit("close"));
	}
}