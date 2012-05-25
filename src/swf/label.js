/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function defineLabel(tag, dictionary) {
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
      assert(font, 'undefined font', 'label');
      var codes = font.codes;
      cmds.push('font="' + record.fontHeight + 'px \'' + font.name + '\'"');
      dependencies.push(font.id);
    }
    if (record.hasColor)
      cmds.push('fillStyle="' + toStringRgba(record.color) + '"');
    if (record.hasMoveX)
      x = record.moveX;
    if (record.hasMoveY)
      y = record.moveY;
    var entries = record.entries;
    var j = 0;
    var entry;
    while (entry = entries[j++]) {
      var code = codes[entry.glyphIndex];
      assert(code, 'undefined glyph', 'label');
      var text = code >= 32 && code != 34 && code != 92 ? fromCharCode(code) :
        '\\u' + (code + 0x10000).toString(16).substring(1);
      cmds.push('fillText("' + text + '",' + x + ',' + y + ')');
      x += entry.advance;
    }
  }
  cmds.push('restore()');
  var shape = {
    type: 'shape',
    id: tag.id,
    bounds: tag.bounds,
    data: cmds.join('\n')
  };
  if (dependencies.length)
    shape.require = dependencies;
  return shape;
}
