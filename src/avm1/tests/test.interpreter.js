/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var MovieClip = function MovieClipMock() {
};

describe('AVM1 Interpreter', function(){
  var DefaultSwfVersion = 11;

  describe('#isMovieClip()', function(){
    it('should return bytes in right order', function(){
      expect(isMovieClip(new MovieClip())).to.be.ok();
      expect(isMovieClip(new Object())).to.not.be.ok();
    })
  })

  describe('#executeActions()', function(){
    it('should do nothing', function(){
      executeActions(new Uint8Array([0]), { swfVersion: DefaultSwfVersion });
    })
  })

})
