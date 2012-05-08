/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

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
