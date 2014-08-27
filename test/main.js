var mocha = require('mocha');
var should = require('should');
var fs = require('fs');

var codec = require('../lib/codec');

describe('encoder', function () {
    it('should encode plain text', function () {
        var enc = new codec.Encoder();
        var privateKey = fs.readFileSync(process.env.HOME + '/.ssh/id_rsa', 'ascii');
        var signed = enc.encode('HELLO_world', 'user1', privateKey);
        signed.should.endWith('.SEVMTE9fd29ybGQ=');
        signed.should.startWith('dXNlcjE=.');
    });

    it('should encode json', function () {
        var enc = new codec.Encoder();
        var privateKey = fs.readFileSync(process.env.HOME + '/.ssh/id_rsa', 'ascii');
        var signed = enc.encodeJSON({text: 'HELLO_world'}, 'user1', privateKey);
        signed.should.endWith('.eyJ0ZXh0IjoiSEVMTE9fd29ybGQifQ==');
        signed.should.startWith('dXNlcjE=.');
    });
});

describe('decoder', function () {
    it('should decode plain text', function (done) {
        var enc = new codec.Encoder();

        var privateKey = fs.readFileSync(process.env.HOME + '/.ssh/id_rsa', 'ascii');
        var publicKey = fs.readFileSync(process.env.HOME + '/.ssh/id_rsa.pub', 'ascii');
        var keyStore = {
            user1: publicKey
        };

        var dec = new codec.Decoder({
            keyResolver: function (userId) {
                return keyStore[userId];
            }
        });


        var signed = enc.encode('HELLO_world', 'user1', privateKey);
        dec.decode(signed)
            .then(function (res) {
                res.userId.should.equal('user1');
                res.data.should.equal('HELLO_world');
                done();
            }, function () {
                done();
            }).done();
    });
});