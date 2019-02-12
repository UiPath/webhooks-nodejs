'use strict';

// native
var inherits = require('util').inherits;
var http = require('http');

// local
var PayloadHandler = require('./PayloadHandler');

/** @type {string} */
var SIGNATURE_HEADER = 'x-uipath-signature';
/** @type {Error} */
var ERROR_UNSUPPORTED = new Error('Unsupported HTTP method');

/**
 * @param {IncomingMessage} req
 * @param {function(Error, Buffer=)} cb
 */
function handleIncomingRequest(req, cb) {
    /** @type {Array.<Buffer>} */
    var data = [];
    /** @type {boolean} */
    var done = false;

    if (req.method !== 'POST') {
        cb(ERROR_UNSUPPORTED);
        return;
    }

    req.on('data', function (chunk) {
        data.push(chunk);
    });
    req.on('end', function () {
        if (done) {
            return;
        }
        done = true;
        cb(undefined, Buffer.concat(data));
    });
    req.on('error', function (err) {
        if (done) {
            return;
        }
        done = true;
        cb(err);
    });
}

/**
 * @param {WebhookServer} self
 * @returns {function}
 */
function httpHandlerFactory(self) {
    return function (req, res) {
        handleIncomingRequest(
            req,
            function (err, data) {
                if (err) {
                    res.writeHead(400);
                    res.end(err.message);
                    return;
                }
                if (self.process(data, req.headers[SIGNATURE_HEADER]) === false) {
                    res.writeHead(400);
                    res.end('Invalid signature or payload');
                    return;
                }
                res.writeHead(202);
                res.end();
            }
        );
    }
}

/**
 * @constructor
 * @param {string} [secret]
 * @inherits {PayloadHandler}
 */
function WebhookServer(secret) {
    PayloadHandler.call(this, secret);
    this._server = http.createServer(httpHandlerFactory(this));
}

inherits(WebhookServer, PayloadHandler);

// noinspection JSUnusedGlobalSymbols
WebhookServer.prototype.listen = function () {
    this._server.listen.apply(this._server, arguments);
};

/**
 * @param handler
 * @returns {Server}
 */
module.exports = WebhookServer;
