/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

if (typeof window === 'undefined') {
  importScripts(
    'DataView.js',

    'util.js',
    'swf.js',

    'types.js',
    'structs.js',
    'tags.js',
    'inflate.js',
    'stream.js',
    'templates.js',
    'generate.js',
    'parse.js',

    'font.js',
    'shape.js',
    'text.js',
    'cast.js'
  );

  function process(buffer) {
    var dictionary = { };
    var i = 0;
    SWF.parse(buffer, {
      onstart: function(result) {
        self.postMessage(result);
      },
      onprogress: function(result) {
        var tags = result.tags;
        var tag = tags[tags.length - 1];
        var subtags = tag.type === 'frame' ? tags.slice(i) : [tag];
        var data = cast(subtags, dictionary);
        i += subtags.length;
        self.postMessage(data);
      },
      oncomplete: function(result) {
        self.postMessage(result);
      }
    });
  }

  self.onmessage = function(event) {
    if (typeof event.data === 'object') {
      var file = event.data;
      if (self.FileReaderSync) {
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
  var worker = new Worker('../worker.js');
  worker.onmessage = function(event) {
    console.log(event.data);
  };
}
