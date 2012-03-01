/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function defineText(tag, dictionary) {
  var records = tag.records;
  var matrix = tag.matrix;
  var cmds = [
    'save()', 
    'transform(' +
  	  [
        matrix.scaleX,
        matrix.skew0,
        matrix.skew1,
        matrix.scaleY,
        matrix.translateX,
        matrix.translateY
      ].join(',') +
    ')'
  ];
  var dependencies = [];
  var x = 0;
  var y = 0;
  var i = 0;
  var record;
  while (record = records[i++]) {
    if (record.eot)
      break;
    if (record.hasFont) {
      var font = dictionary[record.fontId];
      var codes = font.codes;
      cmds.push('font="' + record.fontHeight + 'px ' + font.name + '"');
      dependencies.push(record.fontId);
    }
    if (record.hasColor)
      cmds.push('fillStyle="' + colorToString(record.color) + '"');
    if (record.hasMoveX)
      x = record.moveX;
    if (record.hasMoveY)
      y = record.moveY;
    var entries = record.entries;
    var text = '';
    var j = 0;
    var entry;
    while (entry = entries[j++]) {
	    var code = codes[entry.glyphIndex];
      cmds.push('fillText("' + fromCharCode(code) + '",' + x + ',' + y + ')');
      x += entry.advance;
    }
  }
  cmds.push('restore()');
  var shape = {
    type: 'shape',
    id: tag.id,
    bounds: tag.bounds,
    data: cmds.join(';')
  };
  if (dependencies.length)
    shape.require = dependencies;
  return shape;
}
