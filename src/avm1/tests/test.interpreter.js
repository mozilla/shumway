/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var MovieClip = function MovieClipMock() {
};

describe('AVM1 Interpreter', function() {
  var DefaultSwfVersion = 11;

  describe('#isMovieClip()', function() {
    it('should return true is the object is a movieclip, false - otherwise', function(){
      expect(isMovieClip(new MovieClip())).to.be.ok();
      expect(isMovieClip(new Object())).to.not.be.ok();
    })
  })

  describe('#executeActions()', function() {
    it('should do nothing', function() {
      var as2Context = new AS2Context(11);
      var scope = {};
      executeActions(new Uint8Array([0]), as2Context, as2Context.initialScope.create(scope));
    }),

    it('should execute square.swf code', function() {
      var actionsData = [142, 19, 0, 115, 113, 117, 97, 114, 101, 0, 1, 0, 2, 42, 0, 1, 118,
        97, 108, 0, 9, 0, 150, 4, 0, 4, 1, 4, 1, 12, 62, 150, 21, 0, 0, 115, 0, 7, 3, 0, 0,
        0, 7, 1, 0, 0, 0, 0, 115, 113, 117, 97, 114, 101, 0, 61, 60, 0];
      var as2Context = new AS2Context(11);
      var scope = {};
      executeActions(new Uint8Array(actionsData), as2Context, as2Context.initialScope.create(scope));
      expect(scope.s).to.be(9);
      expect('square' in scope).to.ok();
    })
  })

})
