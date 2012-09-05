/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var expect = require('expect.js');
require('./domstubs.js');
require('../classes.js');

describe('Array', function() {
  describe('#sort()', function() {
    it('should sort strings', function() {
      var ar = ['b', 'a', 'c'];
      ar.sort();
      expect(ar.length).to.be(3);
      expect(ar[0]).to.be('a');
      expect(ar[1]).to.be('b');
      expect(ar[2]).to.be('c');
    })
  })
})

describe('AS2Classes', function() {
  describe('#createBuiltinType()', function() {
    // see more about the function http://www.flashguru.co.uk/assetpropflags
    it('should create Array with not arguments', function() {
      var obj;
      obj = createBuiltinType(Array, []);
      expect(obj instanceof Array).to.be.ok();
    })

    it('should create Array using number of elements', function() {
      var obj;
      obj = createBuiltinType(Array, [3]);
      expect(obj instanceof Array).to.be.ok();
      expect(obj.length).to.be(3);
    })

    it('should create Array using elements', function() {
      var obj;
      obj = createBuiltinType(Array, ['3']);
      expect(obj instanceof Array).to.be.ok();
      expect(obj.length).to.be(1);
      expect(obj[0]).to.be('3');
    })

    it('should create Boolean with false', function() {
      var obj;
      obj = createBuiltinType(Boolean, [false]);
      expect(typeof obj).to.be('boolean');
      expect(obj).to.be(false);
    })

    it('should create Boolean with true', function() {
      var obj;
      obj = createBuiltinType(Boolean, [true]);
      expect(typeof obj).to.be('boolean');
      expect(obj).to.be(true);
    })
  })
})

describe('AS2Stage', function() {
  return; // XXX disables AS2Stage tests

  describe('#width', function() {
    it('should return stage width', function() {
      AS2Context.instance = new AS2Context(11, {width: 100, height: 50});
      expect(AS2Stage.width).to.be(100);
    })
  })

  describe('#height', function() {
    it('should return stage height', function() {
      AS2Context.instance = new AS2Context(11, {width: 100, height: 50});
      expect(AS2Stage.height).to.be(50);
    })
  })

  describe('#onFullScreen', function() {
    it('should dispath onFullScreen', function() {
      var track = [];
      var listener = {
        onFullScreen: function(bFull) { track.push(bFull); }
      };
      AS2Stage.addListener(listener);
      AS2Stage.$dispatchEvent('onFullScreen', [true]);
      AS2Stage.$dispatchEvent('onFullScreen', [false]);
      AS2Stage.removeListener(listener);
      AS2Stage.$dispatchEvent('onFullScreen');
      expect(track.join(',')).to.be('true,false');
    })
  })

  describe('#onResize', function() {
    it('should dispath onResize', function() {
      var invoked = 0;
      var listener = {
        onResize: function() { invoked++; }
      };
      AS2Stage.addListener(listener);
      AS2Stage.$dispatchEvent('onResize');
      AS2Stage.removeListener(listener);
      AS2Stage.$dispatchEvent('onResize');
      expect(invoked).to.be(1);
    })
  })
})
