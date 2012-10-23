/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function defineText(tag, dictionary) {
  var cmds = [];
  cmds.push('c.save()');
  cmds.push('c.scale(0.05, 0.05)');
  var dependencies = [];
  if (tag.hasText) {
    if (tag.hasFont) {
      var font = dictionary[tag.fontId];
      assert(font, 'undefined font', 'label');
      cmds.push('c.font="' + tag.fontHeight + 'px \'' + font.name + '\'"');
      dependencies.push(font.id);
    }
    if (tag.hasColor)
      cmds.push('c.fillStyle="' + toStringRgba(tag.color) + '"');
    cmds.push('c.fillText(this.text,0,' + (tag.fontHeight - tag.leading - tag.bounds.yMin) + ')');
	var initialText = tag.html ? tag.initialText.replace(/<[^>]*>/g, '') : tag.initialText;
  } else {
  	var initialText = '';
  }
  cmds.push('c.restore();');
  var text = {
    type: 'text',
    id: tag.id,
    variableName: tag.variableName,
    value: initialText,
    data: cmds.join('\n')
  };
  if (dependencies.length)
    text.require = dependencies;
  return text;
}
