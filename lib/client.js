var crypto = require('crypto');
var request = require('request');
var q = require('q');
var encoder = require('./encoder');

function RPCClient(url, userId, privateKey) {
  this._url = url;
  this._userId = userId;
  this._privateKey = privateKey;
}

RPCClient.prototype.call = function(method, args) {
  var packet = {
    method: method,
    args: args
  };

  var signedPacket = encoder.createSignedPacket(packet, this._userId, this._privateKey);

  request.post(this._url, signedPacket);
  //TODO: etc
};

module.exports = RPCClient;