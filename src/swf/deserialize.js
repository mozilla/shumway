/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

document.head.insertBefore(
  document.createElement('style'),
  document.head.getElementsByTagName('style')[0]
);
var style = document.styleSheets[0];

SWF.deserialize = function(obj, dictionary) {
  var target = { };
  for (var prop in obj)
    target[prop] = obj[prop];
  switch (obj.type) {
  case 'character':
    target.render = eval('(' + target.render + ')');
    break;
  case 'font':
    style.insertRule(target.style, 0);
    target.style = style.cssRules[0];
    break;
  case 'img':
    var img = new Image;
    img.src = target.img;
    target.img = img;
    break;
  }
  return target;
};
