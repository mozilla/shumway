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
    var controlTags = [];
    SWF.parse(buffer, {
      onstart: function(result) {
        self.postMessage(result);
      },
      onprogress: function(result) {
        var tags = result.tags.slice(i);
        i += tags.length;
        var tag = tags[tags.length - 1];
        if (tag.id) {
          cast(tags.splice(-1, 1), dictionary);
          controlTags.push(tags);
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
        self.close();
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
  function work(file, callback) {
    var worker = new Worker('../worker.js');
    worker.onmessage = function(event) {
      callback(event.data);
    };
    worker.postMessage(file);  
  }
}
