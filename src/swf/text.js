/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil -*- */

function defineText(tag, dictionary) {
  var cmds = [];
  cmds.push('c.save()');
  cmds.push('c.beginPath()');
  cmds.push('c.rect(' + tag.bbox.left + ', ' + tag.bbox.top + ', ' +
                        (tag.bbox.right - tag.bbox.left) + ', ' +
                        (tag.bbox.bottom - tag.bbox.top) + ')');
  cmds.push('c.clip()');
  cmds.push('c.scale(0.05, 0.05)');
  var dependencies = [];
  var y;
  if (tag.hasText) {
	var initialText = tag.html ? tag.initialText.replace(/<[^>]*>/g, '') : tag.initialText;
  } else {
  	var initialText = '';
  }

  if (tag.hasFont) {
    y = tag.fontHeight - tag.leading;
    var font = dictionary[tag.fontId];
    assert(font, 'undefined font', 'label');
    cmds.push('c.font="' + tag.fontHeight + 'px \'' + font.name + '\'"');
    dependencies.push(font.id);
  } else {
    // height of 12pt in twips
    y = 12 * (92 / 72) * 20;
    cmds.push('c.font="' + y + 'px \'sans\'"');
  }
  if (tag.hasColor)
    cmds.push('c.fillStyle="' + toStringRgba(tag.color) + '"');
  cmds.push('c.fillText(this.text,0,' + (y - 20 * tag.bbox.top) + ')');

  cmds.push('c.restore();');
  var text = {
    type: 'text',
    id: tag.id,
    bbox: tag.bbox,
    variableName: tag.variableName,
    value: initialText,
    data: cmds.join('\n')
  };
  if (dependencies.length)
    text.require = dependencies;
  return text;
}
