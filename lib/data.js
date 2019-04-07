/*
 * Library for storing and editing data
 *
 *
 */

 // Dependencies
 const fs = require('fs');
 const path = require('path');
 const helpers = require('./helpers');

 // Container for the module (to be exported)
 const lib = {
     create: create,
     read: read,
     update: update,
     delete: _delete
 };

 // Base directory of the data folder
 lib.baseDir = path.join(__dirname, '/../.data/');

 // Write data to a file
 function create(dir, file, data, callback) {

    const fileAccessFlag = 'wx'; // Open file for writing. The file is created (if it does not exist) or fail (if it exists).
    const fileFullPath = `${lib.baseDir}${dir}/${file}.json`;

    // Open the file or writing
    fs.open(fileFullPath, fileAccessFlag, openFileCallback(data, callback));
    
 };

 function _delete(dir, file, callback) {
    const fileFullPath = `${lib.baseDir}${dir}/${file}.json`;

    fs.unlink(fileFullPath, function(err) {
        if(!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
 };

 // Read data from a file
 function read(dir, file, callback) {
    const encoding = 'utf8';
    const fileFullPath = `${lib.baseDir}${dir}/${file}.json`;

    fs.readFile(fileFullPath, encoding, function(err, data) {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
 };

 // Update data inside a file
 function update(dir, file, data, callback) {
    const fileAccessFlag = 'r+';
    const fileFullPath = `${lib.baseDir}${dir}/${file}.json`;

    // Open the file for writing
    fs.open(fileFullPath, fileAccessFlag, function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            // Truncate the file
            fs.truncate(fileDescriptor, function(err) {
                if(!err) {
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, function(err) {
                        if (!err) {
                            fs.close(fileDescriptor, function(err) {
                                if(!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                }
            });

        } else {
            callback('Could not open the file for updating');
        }
    });
 };

 function openFileCallback(data, callback) {
     return (err, fileDescriptor) => {

        // Convert data to string
        const stringData = JSON.stringify(data);

        if(!err && fileDescriptor) {
            fs.writeFile(fileDescriptor, stringData, writeFileCallback(fileDescriptor, callback));
        } else {
            callback('Could not create new file, it may already exist');
        }
     };
 };

 function writeFileCallback(fileDescriptor, callback) {
     return (err) => {
        if(!err) {
            fs.close(fileDescriptor, closeFileCallback(callback))
        } else {
            callback('Error writing to new file');
        }
     };
 };

 function closeFileCallback(callback) {
     return (err) => {
        if(!err) {
            callback(false);
        } else {
            callback('Erro closing new file');
        }
     };
 };

 // Export the module
 module.exports = lib;