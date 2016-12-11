const uuid = require("uuid");
const message = require("./messaging.js");
const tabs = require("./tabs.js");
const DB_CONSTANTS = require("./../../../shared/db_constants.json");

chrome.webRequest.onCompleted.addListener(
    (details) => {
        // check if current tab has a previous (stored) url
        var previousTab = tabs.getPreviousByID(details.tabId)
        if(!previousTab && details.openerTabId){
            previousTab = tabs.getPreviousByID(details.openerTabId);
        }

        // object to send
        var result = {
           url: details.url,
           timestamp: details.timeStamp
        };

        // if the hostname of the previoustab is equal to the current, then update the db record
        if(previousTab && new URL(previousTab.url).hostname == new URL(details.url).hostname){
            result.id = previousTab.webtrotterId;
            result.type = DB_CONSTANTS.UPDATE;
        }

        result.id = uuid();
        message.send(result);

        details.webtrotterId = result.id;
        tabs.store(details);
    }, {
        urls: ["http://*/*", "https://*/*"],
        types: ["main_frame"]
    }, ["responseHeaders"]
);
