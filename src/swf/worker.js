/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

if (typeof window === 'undefined') {
  print = function (message) {
      console.log(message);
  };
  var webShell = true;
  importScripts('../avm2/util.js');
  var options = new OptionSet("option(s)");
  var traceLevel = options.register(new Option("traceLevel", "t", 0, "trace level"));

  importScripts(
    'DataView.js',

    'swf.js',
    'util.js',

    'types.js',
    'structs.js',
    'tags.js',
    'inflate.js',
    'stream.js',
    'templates.js',
    'generator.js',
    'parser.js',

    'bitmap.js',
    'font.js',
    'image.js',
    'shape.js',
    'text.js',
    'cast.js',

    '../avm2/constants.js',
    '../avm2/opcodes.js',
    '../avm2/parser.js',
    '../avm2/analyze.js',
    '../avm2/viz.js',
    '../avm2/compiler.js',
    '../avm2/runtime.js',
    '../avm2/disassembler.js',
    '../avm2/interpreter.js'
  );

  function process(buffer) {
    var i = 0;
    var dictionary = { };
    var controlTags = [];
    SWF.parse(buffer, {
      onstart: function(result) {
        self.postMessage(result);
      },
      onprogress: function(result) {
        var tags = result.tags.slice(i);
        i += tags.length;
        var tag = tags[tags.length - 1];
        if ('id' in tag) {
          cast(tags.splice(-1, 1), dictionary);
          push.apply(controlTags, tags);
          if (tag.id)
            self.postMessage(dictionary[tag.id]);
        } else {
          var pframes = cast(controlTags.concat(tags), dictionary);
          controlTags = [];
          var j = 0;
          var pframe;
          while (pframe = pframes[j++])
            self.postMessage(pframe);
        }
      },
      oncomplete: function(result) {
        self.postMessage(result);
        self.postMessage(null);
      }
    });
  }

  self.onmessage = function(event) {
    if (typeof event.data === 'object') {
      var file = event.data;
      if (file instanceof ArrayBuffer) {
        process(file);
      } else if (self.FileReaderSync) {
        var reader = new FileReaderSync;
        var result = reader.readAsArrayBuffer(file);
        process(result);
      } else {
        var reader = new FileReader;
        reader.onload = function() {
          process(this.result);
        };
        reader.readAsArrayBuffer(file);
      }
    } else {
      var url = event.data;
      var xhr = new XMLHttpRequest;
      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function() {
        process(this.response);
      };
      xhr.send();
    }
  };
} else {
  var workerPath = 'workerPath' in SWF ? SWF.workerPath : '../worker.js';
  var worker = new Worker(workerPath);
  function startWorking(file, callback) {
    worker.onmessage = function(event) {
      callback(event.data);
    };
    worker.postMessage(file);  
  }
}
