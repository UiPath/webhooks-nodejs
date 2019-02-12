'use strict';

// native
var EventEmitter = require('events');
var inherits = require('util').inherits;

// local
var signatureCheck = require('./signature').check;

/**
 * @constructor
 * @param {string} [secret]
 * @inherits {EventEmitter}
 */
function PayloadHandler(secret) {
    EventEmitter.call(this);
    /**
     * @private
     * @type {string|undefined}
     */
    this._secret = secret;
}

inherits(PayloadHandler, EventEmitter);

/**
 * @param {Buffer|string} data
 * @returns {Object}
 */
function parseSafe(data) {
    var output;
    try {
        output = JSON.parse(data.toString());
    } catch(e) {}
    if (typeof output !== 'object' || output === null) {
        output = {};
    }
    return output;
}

/**
 * @param {Buffer|string} payload
 * @param {string} signature
 * @returns {boolean} true for success, false otherwise
 */
PayloadHandler.prototype.process = function (payload, signature) {
    /** @type {string} */
    var eventType;
    /** @type {WebhookPayload} */
    var parsedPayload;

    if (signature) {
        if (!this._secret) {
            // we have a signature but no secret configured: unexpected
            return false;
        }
        if (signatureCheck(this._secret, signature, payload.toString()) === false) {
            // signature check failed
            return false;
        }
    } else if (this._secret) {
        // we expect a signature and there were none
        return false;
    }

    parsedPayload = parseSafe(payload);
    eventType = parsedPayload && parsedPayload.Type;
    if (typeof eventType === 'string') {
        this.emit(eventType, parsedPayload);
        return true;
    } else {
        return false;
    }
};

/**
 * @param handler
 * @returns {Server}
 */
module.exports = PayloadHandler;

/**
 * @typedef {Object} WebhookPayload
 * @property {string} Type
 * @property {string} EventId
 * @property {string} Timestamp
 * @property {number} TenantId
 * @property {number} OrganizationUnitId: 1,
 * @property {number} UserId
 */
