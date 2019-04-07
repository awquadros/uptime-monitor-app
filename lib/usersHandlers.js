// Dependencies
const _data = require('./data');
const _helpers = require('./helpers');

function users(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        methods[data.method](data, callback);
    } else {
        callback(405);
    }
};

module.exports = users;

//////////////////////////

const methods = {
    delete: deleteUser,
    get: getUser,
    post: createUser,
    put: putUser
};

function deleteUser(data, callback) {
    // Check that phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        // Lookup the user
        _data.read('users',phone,function(err,data){
        if(!err && data){
            _data.delete('users',phone,function(err){
            if(!err){
                callback(200);
            } else {
                callback(500,{'Error' : 'Could not delete the specified user'});
            }
            });
        } else {
            callback(400,{'Error' : 'Could not find the specified user.'});
        }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'})
    }
};

function putUser(data, callback) {
    // Check for required field
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if phone is invalid
    if(phone){
        // Error if nothing is sent to update
        if(firstName || lastName || password){
        // Lookup the user
        _data.read('users',phone,function(err,userData){
            if(!err && userData){
            // Update the fields if necessary
            if(firstName){
                userData.firstName = firstName;
            }
            if(lastName){
                userData.lastName = lastName;
            }
            if(password){
                userData.hashedPassword = helpers.hash(password);
            }
            // Store the new updates
            _data.update('users',phone,userData,function(err){
                if(!err){
                callback(200);
                } else {
                console.log(err);
                callback(500,{'Error' : 'Could not update the user.'});
                }
            });
            } else {
            callback(400,{'Error' : 'Specified user does not exist.'});
            }
        });
        } else {
        callback(400,{'Error' : 'Missing fields to update.'});
        }
    } else {
        callback(400,{'Error' : 'Missing required field.'});
    }
};

// Users - get
// Required data: phone
// Optional data: none
function getUser(data, callback) {
    // Check that phone number is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
    // Lookup the user
    _data.read('users',phone,function(err,data){
        if(!err && data){
        // Remove the hashed password from the user user object before returning it to the requester
        delete data.hashedPassword;
        callback(200,data);
        } else {
        callback(404);
        }
    });
    } else {
    callback(400,{'Error' : 'Missing required field'})
    }
};

function validateNewUser(data) {
    return new Promise((resolve, reject) => {
        try {
            // Check that all required fields are filled out
            const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0
                ? data.payload.firstName.trim()
                : false;
            const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0
                ? data.payload.lastName.trim()
                : false;
            const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 10
                ? data.payload.phone.trim()
                : false;
            const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0
                ? data.payload.password.trim()
                : false;            
            const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true;

            if (!firstName || !lastName || !phone || !password || !tosAgreement) {
                reject({ 'code': 400, 'message' : 'Missing required fields' });
            };

            resolve({
                firstName,
                lastName,
                phone,
                password,
                tosAgreement
            });

        } catch (error) {
            reject({ 'code': 400, 'message': 'Unspected error on validating required fields'});
        }
    });
};

function checkIfUserNotExist(user) {
    return new Promise((resolve, reject) => {
        try {
            _data.read('users', user.phone, (err, data) => {
                if (!err) {
                    reject({ 'code': 400, 'message': 'A user with that phone number already exists'});
                } else {
                    resolve(user);
                }
            });   
        } catch (error) {
            reject({ 'code': 400, 'message': 'Unspected error trying figure out if user already exists'});
        }
    });
};

function hashUserPassword(user) {
    return new Promise((resolve, reject) => {
        // Hash the password
        const hashedPassword = _helpers.hash(user.password);

        if (hashedPassword) {
            // Create the user object
            resolve({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                hashedPassword,
                tosAgreement: user.tosAgreement
            });
        } else {
            reject({ 'code': 500, 'message' : 'Could not hash the user\'s password' });
        }
    })
};

function storeUser(user) {
    return new Promise((resolve, reject) => {
        // Store the User
        _data.create('users', user.phone, user, (err) => {
            if (!err) {
                resolve();
            } else {
                reject({ 'code': 500, 'message' : 'Could not create the new user'});
            }
        });
    });
};

function createUser(data, callback) {

    validateNewUser(data)
        .then(checkIfUserNotExist)
        .then(hashUserPassword)
        .then(storeUser)
        .then(() => {
            callback(200);
        })
        .catch((error) => {
            callback(error.code, { 'Error': error.message });
        });
};