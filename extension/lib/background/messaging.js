var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter

var hostName = "webtrotter.lemnis.github.io";
appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")

var port = chrome.runtime.connectNative(hostName);
function appendMessage(text) {
    console.log(text);
}

function Message() {
  if (! (this instanceof Message)) return new Message();

  this._started = false;

  EventEmitter.call(this);
}

inherits(Message, EventEmitter);

Message.prototype.send = function(msg) {
    port.postMessage(msg);
}

Message.prototype.received = function(msg){
    console.log("received", msg);

    this.emit("received", msg);
}

Message.prototype.disconnect = function(msg){
    var msg = "Failed to connect: " + chrome.runtime.lastError.message;

    appendMessage(msg);
    port = null;
}

var message = new Message();

port.onMessage.addListener(function(msg){
    message.received(msg);
});
port.onDisconnect.addListener(function(msg){
    message.disconnect(msg);
});

module.exports = message;
