/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var expect = require('expect.js');
require('./domstubs.js');
require('../classes.js');
require('../globals.js');

describe('AS2Globals', function() {
  describe('#ASSetPropFlags()', function() {
    // see more about the function http://www.flashguru.co.uk/assetpropflags
    it('should accept three arguments and object', function() {
      var globals = new AS2Globals(null);
      var obj = {};
      globals.ASSetPropFlags(obj, null, 1);
      expect(true).to.be.ok();
    })
  })

  describe('#MovieClip()', function() {
    it('should return the global AS2MovieClip constructor', function(){
      var globals = new AS2Globals(null);
      expect(globals.MovieClip).to.be(AS2MovieClip);
    })
  })

  describe('#_global', function() {
    it('should return itself', function() {
      var globals = new AS2Globals(null);
      expect(globals._global).to.be(globals);
    })
  })

  describe('#int()', function() {
    it('should return int numbers', function() {
      var globals = new AS2Globals(null);
      expect(globals.int(-12.3)).to.be(-12);
      expect(globals.int(12.3)).to.be(12);
      expect(globals.int(-11.7)).to.be(-11);
      expect(globals.int(11.7)).to.be(11);
      expect(globals.int(0)).to.be(0);
    })
  })

  describe('#random()', function() {
    it('should return different numbers', function() {
      var globals = new AS2Globals(null);
      // using large enought range of the numbers to generate several outputs
      var maxInt = 500;
      var count = 10;
      var outputs = [];
      for (var i = 0; i < count; i++) {
        var output = globals.random(maxInt);
        expect(typeof output).to.be('number');
        expect(output >= 0 && output < maxInt && output === (0 | output)).to.be.ok();
        outputs[output] = true;
      }
      var differentNumbers = 0;
      for (var j in outputs)
        differentNumbers++;
      expect(differentNumbers > 1).to.be.ok();
    });
  })
})
