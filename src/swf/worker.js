/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

/** @define {string} */ var workerScripts = 'DataView.js,util.js,swf.js,\
types.js,structs.js,tags.js,inflate.js,stream.js,templates.js,generator.js,\
parser.js,bitmap.js,button.js,font.js,image.js,label.js,shape.js,text.js,cast.js';

if (typeof window === 'undefined') {
  importScripts.apply(null, workerScripts.split(','));

  function process (buffer) {
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
          cast(tags.splice(-1, 1), dictionary, declare);
          push.apply(controlTags, tags);
        } else if ('ref' in tag) {
          var id = tag.ref - 0x4001;
          assert(id in dictionary, 'undefined object', 'ref');
          var obj = create(dictionary[id]);
          for (var prop in tag) {
            if (prop !== 'id' && prop !== 'ref')
              obj[prop] = tag[prop];
          }
          dictionary[id] = obj;
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
  function declare(obj) {
    if (obj.id)
      self.postMessage(obj);
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
  var path = SWF.workerPath || 'worker.js';
  var worker = new Worker(path);

  function startWorking(file, callback) {
    worker.onmessage = function(event) {
      callback(event.data);
    };
    worker.postMessage(file);  
  }
}
