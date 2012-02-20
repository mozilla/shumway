/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function defineText(tag, dictionary) {
  var records = tag.records;
  var cmds = [];
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
      cmds.push('fillText("' + fromCharCode(codes[entry.glyphIndex]) + '",' + x + ',' + y + ')');
      x += entry.advance;
    }
  }
  var m = tag.matrix;
  return {
    type: 'character',
    id: tag.id,
    bounds: tag.bounds,
    render: 'function(c,m,r){' +
      'with(c){' +
        'save();' +
        'scale(0.05,0.05);' +
        'if(m)transform(m.scaleX,m.skew0,m.skew1,m.scaleY,m.translateX,m.translateY);' +
        'transform(' +
          [m.scaleX, m.skew0, m.skew1, m.scaleY, m.translateX, m.translateY].join(',') +
        ');' +
        cmds.join(';') + ';' +
        'restore()' +
      '}' +
    '}'
  };
}
