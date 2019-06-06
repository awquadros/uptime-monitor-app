const usersHandlers = require('./usersHandlers');
const tokens = require('./handlers/token');
;
// Define Handlers
const handlers = {
    users: usersHandlers,
    ping: ping,
    tokens: tokens.handler,
    notFound: notFound
};

module.exports = handlers;

//////////////////////////

// Ping Handler
function ping(data, callback) {
    // Callback a http status code, and a payload object
    callback(200);
};

// Not found handler
function notFound(data, callback) {
    callback(404);
};
