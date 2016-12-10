// modules
const low = require('lowdb');       // used database library
const uuid = require('uuid');       // generates unique id
const {app} = require('electron');  // to find database location
const path = require('path');       // joins pieces of specific pat

const db = low(path.join(app.getPath('userData'), 'db.json')); // open the db
db.defaults({ urls: []}).value();   // construct the db

/**
 * Insert specific entry to url table
 * @param  {object} data            - entry to store
 * @param  {number} data.id         - unique uuid
 * @param  {string} data.hostname   - hostname of the to store url
 * @param  {array} data.traceroute  - full traceroute of hostname
 * @param  {array} data.urls        - urls of the origin
 * @param  {number} data.timestamp  - timestamp of first request
 * @return {object}                 - type of database action and used id
 */
exports.insertUrl = function(data){
    db.get('urls').push(data).value();

    return {
        type: "INSERT",
        id: data.id
    };
}

/**
 * Adds a url to specific database entry
 * @param {integer} id  - id of specific entry
 * @param {string} url  - url to add
 * @return {object}     - type of database action and used id
 */
exports.addUrl = function(id, url){
    db.get('urls').find({ id }).get('urls').push(url).value()

    return {
        type: "UPDATE",
        id: id
    }
}

exports.addTraceroute = function(id, traceroute){
    db.get('urls').find({ id }).assign({traceroute}).value()

    return {
        type: "UPDATE",
        id: id
    }
}

/**
 * Returns all requests (a.k.a. urls) of a specific day
 * @return {object} - all urls within timerange
 */
exports.getRequests = function(){
    return db.get('urls').value();
}
