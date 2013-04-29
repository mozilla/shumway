/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
require('../stream.js');
require('../classes.js');
require('../globals.js');
require('../interpreter.js');

describe('AVM1 Interpreter', function() {
  var DefaultSwfVersion = 11;

  describe('#executeActions()', function() {
    it('should do nothing', function() {
      var as2Context = new AS2Context(11);
      var scope = {};
      executeActions(new Uint8Array([0]), as2Context, scope);
    }),

    it('should execute square.swf code', function() {
      /*
        function square (val) {
	        return val * val;
        }

        var s = square(3);
      */
      var actionsData = [142, 19, 0, 115, 113, 117, 97, 114, 101, 0, 1, 0, 2, 42, 0, 1, 118,
        97, 108, 0, 9, 0, 150, 4, 0, 4, 1, 4, 1, 12, 62, 150, 21, 0, 0, 115, 0, 7, 3, 0, 0,
        0, 7, 1, 0, 0, 0, 0, 115, 113, 117, 97, 114, 101, 0, 61, 60, 0];
      var as2Context = new AS2Context(11);
      var scope = {};
      executeActions(new Uint8Array(actionsData), as2Context, scope);
      expect(scope.s).to.be(9);
      expect('square' in scope).to.ok();
    })
  })

})

describe('AVM1 Interpreter (Tamarin acceptance tests)', function() {
  function getActionsData(swfData) {
    var swfLength = swfData.length;
    var swfBytes = new Uint8Array(swfLength);
    for (var i = 0; i < swfLength; i++)
      swfBytes[i] = swfData.charCodeAt(i) & 255;
    var actionsData = [], position = 0;
    SWF.parse(swfBytes, { onprogress: function(result) {
      while (position < result.tags.length) {
        var tag = result.tags[position++];
        if ('actionsData' in tag)
           actionsData.push(tag.actionsData);
      }
    }});
    return actionsData;
  }

  var basePath = './acceptance/', filelistPath = basePath + 'testfiles.txt';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', filelistPath, false);
  xhr.send(null)
  if (xhr.status != 200) return;
  var files = xhr.responseText.split('\n');
  for (var i = 0; i < files.length; i++)  {
    if(!files[i]) continue;
    describe(files[i], (function(filename, path) {
      return (function() {
        it('should pass all internal tests in ' + filename, function(){
          var xhr = new XMLHttpRequest();
          xhr.open('GET', path, false);
          xhr.overrideMimeType('text\/plain; charset=x-user-defined');
          xhr.send(null)
          expect(xhr.status).to.be(200)
          var swfData = xhr.responseText;
          var actionsData = getActionsData(swfData);
          expect(actionsData.length > 0).to.be.ok(); // sanity check
          var as2Context = new AS2Context(11);
          var scope = {};
          for (var j = 0; j < actionsData.length; j++)
            executeActions(actionsData[j], as2Context, scope);
          expect('TestCaseResult' in as2Context.globals).to.be.ok();
          var results = as2Context.globals.TestCaseResult;
          var reason = '';
          if (results.failed) {
            var testCases = results.testCases;
            for (var q = 0; q < testCases.length; q++) {
              if (!testCases[q].failed) continue;
              reason += '#' + q + ' | ' + testCases[q].description + ' | ' +
                testCases[q].reason + ' | ' + testCases[q].expect + ' != ' +
                testCases[q].actual + ' / ';
            }
          }
          expect(reason).to.be('');
        })
      })
    })(files[i], basePath + files[i]))
  }
})
