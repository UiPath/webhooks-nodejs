'use strict';

//native
var crypto = require('crypto');

/**
 * @param {string} secret
 * @param {string} signature
 * @param {string} payload
 * @returns {boolean}
 */
module.exports.check = function (secret, signature, payload) {
    var expected = crypto.createHmac('sha256', secret)
        .update(payload.toString())
        .digest('base64');
    return signature === expected;
};
