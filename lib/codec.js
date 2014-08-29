var q = require('q');
var crypto = require('crypto');
var sshKeyToPem = require('ssh-key-to-pem');

var codec = {};

function Encoder(options) {

}

Encoder.prototype.encodeJSON = function(packetJSON, userId, privateKey) {
    var packet = JSON.stringify(packetJSON);
    return this.encode(packet, userId, privateKey);
};

Encoder.prototype.encode = function(packet, userId, privateKey) {
    var rsa = crypto.createSign('RSA-SHA256');
    rsa.update(packet);
    var signature = rsa.sign(privateKey, 'base64');

    return [
        new Buffer(userId).toString('base64'),
        signature,
        new Buffer(packet).toString('base64')
    ].join('.');
};

function Decoder(options) {
    options = options || {};
    this._keyResolver = options.keyResolver;
}

Decoder.prototype.decodeJSON = function(packet) {
    return this.decode(packet)
        .then(function(decodedPacket) {
            decodedPacket.data = JSON.parse(decodedPacket.data);
            return decodedPacket;
        });
};

Decoder.prototype.decode = function(packet) {
    packet = '' + packet;
    var parts = packet.split('.');

    if (parts.length !== 3) {
        return q.when(new Error());
    }

    var b64UserId = parts[0];
    var b64Signature = parts[1];
    var b64Data = parts[2];

    var userId = new Buffer(b64UserId, 'base64').toString('ascii');
    if (!userId.length) {
        return q.when(new Error('userId not parsed'));
    }

    var signature = new Buffer(b64Signature, 'base64');
    if (!signature.length) {
        return q.when(new Error('signature not parsed'));
    }

    var data = new Buffer(b64Data, 'base64');
    if (!data.length) {
        return q.when(new Error('data not parsed'));
    }

    return q.when(this._keyResolver(userId))
        .then(function(key) {
            if (!key) {
                throw new Error('key not found');
            }
            var pem = sshKeyToPem(key);
            var vrf = crypto.createVerify('RSA-SHA256');
            vrf.update(data);
            var valid = vrf.verify(pem, signature, 'base64');
            if (valid) {
                return {
                    userId: userId,
                    data: data.toString('utf8')
                };
            } else {
                throw new Error('verification failed');
            }
        });
};


codec.Encoder = Encoder;
codec.Decoder = Decoder;

module.exports = codec;