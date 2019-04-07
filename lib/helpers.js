/**
 * Helpers for various tasks
 * 
 */

const crypto = require('crypto');
const config = require('./config');

 // Container for all the helpers
const helpers = {
    hash: hash,
    parseJsonToObject: parseJsonToObject
};

module.exports = helpers;

/////////////////////////

function hash(str) {
    return (typeof(str) === 'string' && str.length > 0)
        ? crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        : '';
};

// Parse json string to an object without throwing
function parseJsonToObject(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }
};