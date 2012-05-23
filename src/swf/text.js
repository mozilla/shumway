/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function defineText(tag, dictionary) {
  var cmds = [];
  var dependencies = [];
  if (tag.hasText) {
    if (tag.hasFont) {
      var font = dictionary[tag.fontId];
      assert(font, 'undefined font', 'label');
      cmds.push('font="' + tag.fontHeight + 'px \'' + font.name + '\'"');
      dependencies.push(font.id);
    }
    if (tag.hasColor)
      cmds.push('fillStyle="' + toStringRgba(tag.color) + '"');
    cmds.push('fillText(this.value,0,' + (tag.fontHeight - tag.leading - tag.bounds.yMin) + ')');
	var initialText = tag.html ? tag.initialText.replace(/<[^>]*>/g, '') : tag.initialText;
  } else {
  	var initialText = '';
  }
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
