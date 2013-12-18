/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function configureMocks(remoteFile) {
  if (remoteFile.indexOf('jwplayer') >= 0) {
    // Simulate FirefoxCom interface
    var objId = "jwplayerObjectId";
    $EXTENSION = true;
    window.FirefoxCom = {
      initJS: function (callIn) { this._callIn = callIn; },
      request: function (type, data) {
        switch (data.action) {
          case 'register':
            break; // do nothing atm
          default:
            throw new Error('Unexpected FirefoxCom.request(' + data.action + ')');
        }
      },
      requestSync: function (type, data) {
        if (type === 'getBoolPref') return data.def;
        switch (data.action) {
          case 'eval':
            var expr = data.expression;
            if (expr.indexOf('jwplayer.utils.tea.decrypt') >= 0) {
              return "<string></string>";
            } else if (expr.indexOf('jwplayer.embed.flash.getVars') >= 0) {
              var base = document.location.href;
              base = base.substring(0, base.lastIndexOf('inspector.html'));
              return '<object><property id="aspectratio"><string>56.25%</string></property><property id="playlist"><array><property id="0"><object><property id="sources"><array><property id="0"><object><property id="file"><string>../videoplayer/big_buck_bunny.mp4</string></property><property id="default"><false/></property></object></property></array></property><property id="tracks"><array></array></property><property id="image"><string>../examples/image-loading/firefox.png</string></property><property id="title"><string>test</string></property></object></property></array></property><property id="id"><string>' + objId + '</string></property><property id="base"><string>' + base + '</string></property></object>';
            } else if (expr.indexOf('jwplayer.playerReady') >= 0) {
              // TODO client calls back jwAddEventListener, jwGetWidth/jwGetHeight
              return "<undefined/>";
            } else {
              throw new Error('Unexpected FirefoxCom.requestSync(eval)');
            }
            break;
          case 'getId':
            return objId;
          default:
            throw new Error('Unexpected FirefoxCom.requestSync(' + data.action + ')');
        }
      }
    };
  }
}

function requestYT(yt) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open('GET', 'http://www.youtube.com/watch?v=' + yt, true);
    xhr.onload = function (e) {
      var config = JSON.parse(/ytplayer\.config\s*=\s*(.+?);<\/script/.exec(xhr.responseText)[1]);
      // HACK removing FLVs from the fmt_list
      config.args.fmt_list = config.args.fmt_list.split(',').filter(function (s) {
        var fid = s.split('/')[0];
        return fid !== '5' && fid !== '34' && fid !== '35'; // more?
      }).join(',');

      resolve(config);
    };
    xhr.onerror = function () {
      reject(xhr.error);
    };
    xhr.send(null);
  });
}
