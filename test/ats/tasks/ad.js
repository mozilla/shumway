var parser = require('fast-html-parser');

var commonAdSizes = {
  // https://support.google.com/adsense/answer/6002621
  '300x250': 'Medium Rectangle',
  '336x280': 'Large Rectangle',
  '728x90': 'Leaderboard',
  '300x600': 'Half Page',
  '320x100': 'Large Mobile Banner',
  '320x50': 'Mobile Leaderboard',
  '468x60': 'Banner',
  '234x60': 'Half Banner',
  '120x600': 'Skyscraper',
  '120x240': 'Vertical Banner',
  '160x600': 'Wide Skyscraper',
  '300x1050': 'Portrait',
  '970x90': 'Large Leaderboard',
  '970x250': 'Billboard',
  '250x250': 'Square',
  '200x200': 'Small Square',
  '180x150': 'Small Rectangle',
  '125x125': 'Button',
  '240x400': 'Vertical Rectangle',
  '980x120': 'Panorama',
  '250x360': 'Triple Widescreen',
  '930x180': 'Top Banner',
  '580x400': 'Netboard',
  '750x300': 'Triple Billboard',
  '750x200': 'Double Billboard',
  '750x100': 'Billboard',
  // https://en.wikipedia.org/wiki/Web_banner#Standard_sizes
  '300x100': '3:1 Rectangle',
  '720x300': 'Pop-Under',
  '88x31': 'Micro Bar',
  '120x90': 'Button 1',
  '120x60': 'Button 2'
};

function lowerCaseKeys(obj) {
  for (var key in obj) {
    obj[key.toLowerCase()] = obj[key];
  }
  return obj;
}

function parseQueryString(qs) {
  var obj = Object.create(null);
  if (!qs) {
    return obj;
  }
  var values = qs.split('&');
  for (var i = 0; i < values.length; i++) {
    var pair = values[i].split('=');
    var key = pair[0];
    var value = pair[1];
    if (!(key in obj)) {
      obj[key] = value;
    }
  }
  return obj;
}

exports.run = function (info, cb) {
  var root = parser.parse(info.outerHTML, { lowerCaseTagName: true }).childNodes[0];
  var clickTag;
  var adType;
  var flashvars = [];
  if (info.src.indexOf('?') > -1) {
    flashvars.push(info.src.split('?')[1]);
  }
  var attributes = lowerCaseKeys(root.attributes);
  if (attributes['flashvars']) {
    flashvars.push(attributes['flashvars']);
  }
  if (root.childNodes.length) {
    var nodes = root.childNodes.slice();
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.tagName === 'param') {
        var attributes = lowerCaseKeys(node.attributes);
        if (/^flashvars$/i.test(attributes['name']) && attributes['value']) {
          flashvars.push(attributes['value']);
        }
        if (node.childNodes) {
          nodes.push.apply(nodes, node.childNodes);
        }
      }
    }
  }
  var qs = flashvars.map(function (val) {
    return val.replace('&amp;', '&');
  }).join('&');
  var query = parseQueryString(qs);
  for (var key in query) {
    if (/clickTag/i.test(key)) {
      clickTag = query[key];
      break;
    }
  }
  var parse_result = info.parse_result;
  if (parse_result) {
    adType = commonAdSizes[parse_result.width + 'x' + parse_result.height] ||
             commonAdSizes[parse_result.height + 'x' + parse_result.width];
  }
  var result = null;
  if (clickTag || adType) {
    result = Object.create(null);
    result.clickTag = clickTag;
    result.adType = adType || 'Unknown';
  }
  if (cb) {
    cb(null, result);
  }
};
