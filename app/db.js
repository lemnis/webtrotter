// modules
const low = require('lowdb');       // used database library
const uuid = require('uuid');       // generates unique id
var {app} = require('electron');  // to find database location
const path = require('path');       // joins pieces of specific pat

if(!app){
    var {app} = require('electron').remote;
}

const db = low(path.join(app.getPath('userData'), 'db.json')); // open the db
db.defaults({ urls: []}).value();   // construct the db

db._.mixin({
    today: function(array) {
        var today = new Date(Date.now());
        var beginOfDay =  Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime());
        var endOfDay =  Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime());

        return array.filter((obj) => {
            return (obj.timestamp > beginOfDay && obj.timestamp < endOfDay);
        })
    }
})

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
    var record = db.get('urls').find({ id }).get('urls').push(url).value();

    return {
        type: "UPDATE",
        id: id,
        url: url,
        record: record
    }
}

exports.addTraceroute = function(id, traceroute){
    var record = db.get('urls').find({ id }).assign({traceroute}).value()

    return {
        type: "UPDATE",
        id: id,
        traceroute: traceroute,
        record: record
    }
}

/**
 * Returns all requests (a.k.a. urls) of a specific day
 * @return {object} - all urls within timerange
 */
exports.getRequests = function(){
    return db.get('urls').today().value();
}

exports.getRequest = function(id){
    return db.get('urls').find({ id }).value();
}
