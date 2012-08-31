/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var expect = require('expect.js');
require('../stream.js');

describe('ActionsDataStream', function(){
  var DefaultSwfVersion = 11;

  describe('#readUI8()', function(){
    it('should return bytes in right order', function(){
      var stream = new ActionsDataStream(new Uint8Array([1,2,3]), DefaultSwfVersion);
      expect(stream.readUI8()).to.be(1);
      expect(stream.readUI8()).to.be(2);
      expect(stream.readUI8()).to.be(3);
    })
  })

  describe('#readUI16()', function(){
    it('should return unsigned 16-bit ints', function(){
      var stream = new ActionsDataStream(new Uint8Array([1,0,255,255]), DefaultSwfVersion);
      expect(stream.readUI16()).to.be(1);
      expect(stream.readUI16()).to.be(65535);
    })
  })

  describe('#readSI16()', function(){
    it('should return signed 16-bit ints', function(){
      var stream = new ActionsDataStream(new Uint8Array([1,0,255,255]), DefaultSwfVersion);
      expect(stream.readSI16()).to.be(1);
      expect(stream.readSI16()).to.be(-1);
    })
  })

  describe('#readInteger()', function(){
    it('should return signed 32-bit ints', function(){
      var stream = new ActionsDataStream(new Uint8Array([1,0,255,255]), DefaultSwfVersion);
      expect(stream.readInteger()).to.be(-65535);
    })
  })

  describe('#readFloat()', function(){
    // 3F23D70A = 0.64
    it('should return 32-bit number', function(){
      var stream = new ActionsDataStream(new Uint8Array([0x0A,0xD7,0x23,0x3F]), DefaultSwfVersion);
      expect(stream.readFloat()).to.be.within(0.63999,0.64001);
    })
  })

  describe('#readDouble()', function(){
    it('should return 64-bit number', function(){
      // C0256B851EB851EC = -10.71
      // the two halfs of the double number are swapped in ActionScript presentation
      var stream = new ActionsDataStream(new Uint8Array([0x85,0x6B,0x25,0xC0,0xEC,0x51,0xB8,0x1E]), DefaultSwfVersion);
      expect(stream.readDouble()).to.be(-10.71);
    })
  })

  describe('#readBoolean()', function(){
    it('should return boolean values', function(){
      var stream = new ActionsDataStream(new Uint8Array([0,1]), DefaultSwfVersion);
      expect(stream.readBoolean()).to.be(false);
      expect(stream.readBoolean()).to.be(true);
    })
  })

  describe('#readString()', function(){
    it('should returns UTF8 decoded string for SWF 6+', function(){
      var stream = new ActionsDataStream(new Uint8Array([0x41, 0xD0, 0x90, 0xF0, 0xA0, 0x8A, 0xA4, 0, 64, 0]), 6);
      expect(stream.readString()).to.be('A\u0410\uD840\uDEA4');
      expect(stream.readString()).to.be('@');
    })
  })

  describe('#readString()', function(){
    it('should returns ANSI decoded string for SWF 5', function(){
      var stream = new ActionsDataStream(new Uint8Array([0x41, 0xD0, 0x90, 0xF0, 0xA0, 0x8A, 0xA4, 0, 64, 0]), 5);
      expect(stream.readString()).to.be('A\xD0\x90\xF0\xA0\x8A\xA4');
      expect(stream.readString()).to.be('@');
    })
  })

  describe('#readBytes()', function(){
    it('should returns byte array with specified size', function(){
      var stream = new ActionsDataStream(new Uint8Array([1, 2, 3, 4]), DefaultSwfVersion);
      var ar1 = stream.readBytes(2);
      expect(ar1.length).to.be(2);
      expect(ar1[0]).to.be(1);
      expect(ar1[1]).to.be(2);
      var ar2 = stream.readBytes(1);
      expect(ar2.length).to.be(1);
      expect(ar2[0]).to.be(3);
    })
  })

  describe('#readBytes()', function(){
    it('should returns byte array with truncated size', function(){
      var stream = new ActionsDataStream(new Uint8Array([1, 2]), DefaultSwfVersion);
      var ar1 = stream.readBytes(5);
      expect(ar1.length).to.be(2);
      expect(ar1[0]).to.be(1);
      expect(ar1[1]).to.be(2);
    })
  })
})
