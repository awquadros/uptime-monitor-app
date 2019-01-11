/*
 * Library for storing and editing data
 *
 *
 */

 // Dependencies
 const fs = require('fs');
 const path = require('path');
 const util = require('util');

 // Container for the module (to be exported)
 const lib = {
     create: create
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
     }
 }

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