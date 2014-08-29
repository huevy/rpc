var request = require('request');
var q = require('q');
var codec = require('./codec');
var Call = require('./call');

/**
 * [RPCClient description]
 * @param {String} url        API endpoint URL
 * @param {String} userId     user ID
 * @param {String|Buffer} privateKey user private key
 */
function RPCClient(url, userId, privateKey) {
  this._url = url;
  this._userId = userId;
  this._privateKey = privateKey;

  this.encoder = new codec.Encoder();
}


RPCClient.prototype.call = function(method, args) {
  var callData = new Call(method, args);

  var signedPacket = this.encoder.encodeJSON(callData, this._userId, this._privateKey);

  request.post(this._url, signedPacket);
  //TODO: etc
};

module.exports = RPCClient;