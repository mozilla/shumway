/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

SWF = {
  embed: function(file, stage) {
    worker.postMessage(file);
  }
};
