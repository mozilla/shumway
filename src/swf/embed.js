/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

SWF.embed = function (file, stage) {
  var dictionary = { };
  var timeline = [];
  var displayList = { };
  work(file, function(obj) {
    if (obj) {
      if (obj.id) {
        dictionary[obj.id] = obj;
      } else if (obj.type === 'pframe') {
        for (var depth in obj) {
          if (+depth) {
            var entry = obj[depth];
            depth -= 0x4001;
            if (entry) {
              if (entry.move)
                var character = create(displayList[depth])
              else
                var character = create(dictionary[entry.id] || null)
              for (var prop in entry)
                character[prop] = entry[prop];
              displayList[depth] = character;
            } else {
              displayList[depth] = entry;
            }
          }
        }
        var i = obj.repeat || 1;
        while (i--)
          timeline.push(displayList);
        displayList = create(displayList);
      }
    }
  });
}
