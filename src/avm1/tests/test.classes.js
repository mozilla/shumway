/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

describe('AVM1Classes', function() {
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

describe('AVM1Stage', function() {
  return; // XXX disables AVM1Stage tests

  describe('#width', function() {
    it('should return stage width', function() {
      AVM1Context.instance = new AVM1Context(11, {width: 100, height: 50});
      expect(AVM1Stage.width).to.be(100);
    })
  })

  describe('#height', function() {
    it('should return stage height', function() {
      AVM1Context.instance = new AVM1Context(11, {width: 100, height: 50});
      expect(AVM1Stage.height).to.be(50);
    })
  })

  describe('#onFullScreen', function() {
    it('should dispath onFullScreen', function() {
      var track = [];
      var listener = {
        onFullScreen: function(bFull) { track.push(bFull); }
      };
      AVM1Stage.addListener(listener);
      AVM1Stage.$dispatchEvent('onFullScreen', [true]);
      AVM1Stage.$dispatchEvent('onFullScreen', [false]);
      AVM1Stage.removeListener(listener);
      AVM1Stage.$dispatchEvent('onFullScreen');
      expect(track.join(',')).to.be('true,false');
    })
  })

  describe('#onResize', function() {
    it('should dispath onResize', function() {
      var invoked = 0;
      var listener = {
        onResize: function() { invoked++; }
      };
      AVM1Stage.addListener(listener);
      AVM1Stage.$dispatchEvent('onResize');
      AVM1Stage.removeListener(listener);
      AVM1Stage.$dispatchEvent('onResize');
      expect(invoked).to.be(1);
    })
  })
})
