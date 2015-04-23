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

function configureMocks(queryVariables) {
  var yt = queryVariables['yt'];
  if (yt) {
    return requestYT(yt);
  }
  var fb = queryVariables['fb'];
  if (fb) {
    return FBUtils.readParams(fb);
  }

  var remoteFile = queryVariables['rfile'];
  if (remoteFile) {
    configureExternalInterfaceMocks(remoteFile);

    if (remoteFile.indexOf('fbplayer') >= 0) {
      queryVariables['flashvars'] = 'params=%7B%22auto_hd%22%3Afalse%2C%22autoplay_reason%22%3A%22unknown%22%2C%22default_hd%22%3Afalse%2C%22disable_native_controls%22%3Afalse%2C%22inline_player%22%3Afalse%2C%22pixel_ratio%22%3A2%2C%22preload%22%3Atrue%2C%22start_muted%22%3Afalse%2C%22video_data%22%3A%5B%7B%22hd_src%22%3Anull%2C%22is_hds%22%3Afalse%2C%22is_hls%22%3Afalse%2C%22index%22%3A0%2C%22rotation%22%3A0%2C%22sd_src%22%3A%22https%3A%5C%2F%5C%2Ffbcdn-video-j-a.akamaihd.net%5C%2Fhvideo-ak-xpa1%5C%2Fv%5C%2Ft42.1790-2%5C%2F1496999_252838788222485_1373652694_n.mp4%3Frl%3D500%26vabr%3D278%26oh%3D32a3c1a2318b6cbc02e09fde65299c6a%26oe%3D5488C46A%26__gda__%3D1418253525_20e95da118145fa939f3327b345b9aec%22%2C%22video_id%22%3A%22252838751555822%22%2C%22sd_src_no_ratelimit%22%3A%22https%3A%5C%2F%5C%2Ffbcdn-video-j-a.akamaihd.net%5C%2Fhvideo-ak-xpa1%5C%2Fv%5C%2Ft42.1790-2%5C%2F1496999_252838788222485_1373652694_n.mp4%3Foh%3D32a3c1a2318b6cbc02e09fde65299c6a%26oe%3D5488C46A%26__gda__%3D1418253525_508d29f6f53e87a93e2982aeefe05fb1%22%2C%22subtitles_src%22%3Anull%7D%5D%2C%22show_captions_default%22%3Afalse%2C%22persistent_volume%22%3Atrue%2C%22buffer_length%22%3A0.1%7D&width=520&height=291&user=0&log=no&div_id=id_5488ab933396f4971639505&swf_id=swf_id_5488ab933396f4971639505&browser=Firefox+37.0&tracking_domain=https%3A%2F%2Fpixel.facebook.com&post_form_id=&string_table=https%3A%2F%2Fs-static.ak.facebook.com%2Fflash_strings.php%2Ft98489%2Fen_US';
    } else if (remoteFile.indexOf('yaplayer') >= 0) {
      queryVariables['flashvars'] = 'yId=yui_3_16_0_1_1418312253584_1&YUISwfId=yuiswfyui_3_16_0_1_1418312253584_1913&YUIBridgeCallback=SWF.eventHandler&allowedDomain=news.yahoo.com';
    }
    return null;
  }
}

var FBUtils = {
  parse: function (s) {
    var obj = {};
    s.split('&').forEach(function (line) {
      var i = line.indexOf('=');
      if (i < 0) return;
      obj[decodeURIComponent(line.substring(0, i))] = decodeURIComponent(line.substring(i + 1));
    });
    obj.params = JSON.parse(obj.params);
    return obj;
  },
  stringify: function (obj) {
    var lines = [];
    for (var i in obj) {
      var value = i === 'params' ? JSON.stringify(obj[i]) : obj[i];
      lines.push(encodeURIComponent(i) + '=' + encodeURIComponent(value));
    }
    return lines.join('&');
  },
  readParams: function readFBParams(swfPath) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', swfPath + '.json');
      xhr.onload = function () {
        configureExternalInterfaceMocks(swfPath);
        var obj = JSON.parse(xhr.responseText);
        obj.params = JSON.stringify(obj.params);
        resolve({
          url: swfPath,
          args: obj
        });
      };
      xhr.onerror = function () {
        reject(xhr.error);
      };
      xhr.send(null);
    });
  }
};


function configureExternalInterfaceMocks(remoteFile) {
  if (remoteFile.indexOf('jwplayer') >= 0) {
    // Simulate ExternalInterfaceService
    Shumway.ExternalInterfaceService.instance = {
      enabled: true,
      initJS: function (callback) {
        this._callIn = callback;
      },
      registerCallback: function (functionName) {
        // do nothing atm
      },
      unregisterCallback: function (functionName) {
        // do nothing atm
      },
      eval: function (expr) {
        if (expr.indexOf('jwplayer.utils.tea.decrypt') >= 0) {
          return "<string></string>";
        } else if (expr.indexOf('jwplayer.embed.flash.getVars') >= 0) {
          var base = document.location.href;
          base = base.substring(0, base.lastIndexOf('inspector.html'));
          return '<object><property id="aspectratio"><string>56.25%</string></property><property id="playlist"><array><property id="0"><object><property id="sources"><array><property id="0"><object><property id="file"><string>../videoplayer/big_buck_bunny.mp4</string></property><property id="default"><false/></property></object></property></array></property><property id="tracks"><array></array></property><property id="image"><string>../examples/image-loading/firefox.png</string></property><property id="title"><string>test</string></property></object></property></array></property><property id="id"><string>jwplayerObjectId</string></property><property id="base"><string>' + base + '</string></property></object>';
        } else if (expr.indexOf('jwplayer.playerReady') >= 0) {
          // TODO client calls back jwAddEventListener, jwGetWidth/jwGetHeight
          return "<undefined/>";
        } else {
          throw new Error('Unexpected ExternalInterfaceService::eval()');
        }
      },
      call: function (request) {
        throw new Error('Unexpected ExternalInterfaceService::call()');
      },
      getId: function () {
        return 'jwplayerObjectId';
      }
    };
  } else if (remoteFile.indexOf('fbplayer') >= 0) {
    // Simulate ExternalInterfaceService
    Shumway.ExternalInterfaceService.instance = {
      enabled: true,
      initJS: function (callback) {
        this._callIn = callback;
      },
      registerCallback: function (functionName) {
        // do nothing atm
      },
      unregisterCallback: function (functionName) {
        // do nothing atm
      },
      eval: function (expr) {
        console.info(expr);
        if (expr.indexOf('location.hostname.toString()') >= 0) {
          return "<string>www.facebook.com</string>";
        } else if (expr.indexOf('Arbiter.inform("flash/ready') >= 0) {
          return "<undefined/>";
        } else if (expr.indexOf('Arbiter.inform("flash/buffering') >= 0) {
          return "<undefined/>";
        } else if (expr.indexOf('Arbiter.inform("flash/logEvent') >= 0) {
          return "<undefined/>";
        }

//        throw new Error('Unexpected ExternalInterfaceService::eval()');
      },
      call: function (request) {
        throw new Error('Unexpected ExternalInterfaceService::call()');
      },
      getId: function () {
        return 'swf_id_54513f6f394db3a80901924';
      // params=%7B%22autoplay%22%3Afalse%2C%22auto_hd%22%3Afalse%2C%22autoplay_reason%22%3A%22unknown%22%2C%22autoplay_setting%22%3Anull%2C%22autorewind%22%3Atrue%2C%22click_to_snowlift%22%3Afalse%2C%22default_hd%22%3Afalse%2C%22dtsg%22%3A%22AQHj7qqI9OSB%22%2C%22inline_player%22%3Afalse%2C%22lsd%22%3Anull%2C%22min_progress_update%22%3A300%2C%22pixel_ratio%22%3A1%2C%22player_origin%22%3A%22unknown%22%2C%22preload%22%3Atrue%2C%22source%22%3A%22snowlift%22%2C%22start_index%22%3A0%2C%22start_muted%22%3Afalse%2C%22stream_type%22%3A%22stream%22%2C%22use_spotlight%22%3Afalse%2C%22video_data%22%3A%5B%7B%22hd_src%22%3Anull%2C%22is_hds%22%3Afalse%2C%22is_hls%22%3Afalse%2C%22index%22%3A0%2C%22rotation%22%3A0%2C%22sd_src%22%3A%22https%3A%5C%2F%5C%2Ffbcdn-video-a-a.akamaihd.net%5C%2Fhvideo-ak-xaf1%5C%2Fv%5C%2Ft42.1790-2%5C%2F10463192_744029042321264_667496182_n.mp4%3Foh%3De58e9c10eb34e57202eacb9cf053907d%26oe%3D54515C3B%26__gda__%3D1414618436_6c4bf5a9696c2a7bc9e1d6d2031c975e%22%2C%22thumbnail_src%22%3A%22https%3A%5C%2F%5C%2Ffbcdn-vthumb-a.akamaihd.net%5C%2Fhvthumb-ak-xfa1%5C%2Fv%5C%2Ft15.0-10%5C%2F10549521_744029078987927_744028752321293_49060_1841_b.jpg%3Foh%3D04ca2eacb4c13c4f7fe93a0ac3c5d39a%26oe%3D54F762B6%26__gda__%3D1424481427_b36d5a76b5c644a2c08d22726efcf886%22%2C%22thumbnail_height%22%3A300%2C%22thumbnail_width%22%3A400%2C%22video_duration%22%3A100%2C%22video_id%22%3A%22744028752321293%22%2C%22subtitles_src%22%3Anull%7D%5D%2C%22show_captions_default%22%3Afalse%2C%22persistent_volume%22%3Atrue%2C%22buffer_length%22%3A0.1%7D&amp;width=520&amp;height=390&amp;user=653138652&amp;log=no&amp;div_id=id_54513f6f394db3a80901924&amp;swf_id=swf_id_54513f6f394db3a80901924&amp;browser=Firefox+36.0&amp;tracking_domain=https%3A%2F%2Fpixel.facebook.com&amp;post_form_id=&amp;string_table=https%3A%2F%2Fs-static.ak.facebook.com%2Fflash_strings.php%2Ft98236%2Fen_US

      //  <embed type="application/x-shockwave-flash" src="https://fbstatic-a.akamaihd.net/rsrc.php/v1/yP/r/079p_DX3PYM.swf" style="display: block;" id="swf_id_54513f6f394db3a80901924" name="swf_id_54513f6f394db3a80901924" bgcolor="#000000" quality="high" allowfullscreen="true" allowscriptaccess="always" salign="tl" scale="noscale" wmode="opaque" flashvars="params=%7B%22autoplay%22%3Afalse%2C%22auto_hd%22%3Afalse%2C%22autoplay_reason%22%3A%22unknown%22%2C%22autoplay_setting%22%3Anull%2C%22autorewind%22%3Atrue%2C%22click_to_snowlift%22%3Afalse%2C%22default_hd%22%3Afalse%2C%22dtsg%22%3A%22AQHj7qqI9OSB%22%2C%22inline_player%22%3Afalse%2C%22lsd%22%3Anull%2C%22min_progress_update%22%3A300%2C%22pixel_ratio%22%3A1%2C%22player_origin%22%3A%22unknown%22%2C%22preload%22%3Atrue%2C%22source%22%3A%22snowlift%22%2C%22start_index%22%3A0%2C%22start_muted%22%3Afalse%2C%22stream_type%22%3A%22stream%22%2C%22use_spotlight%22%3Afalse%2C%22video_data%22%3A%5B%7B%22hd_src%22%3Anull%2C%22is_hds%22%3Afalse%2C%22is_hls%22%3Afalse%2C%22index%22%3A0%2C%22rotation%22%3A0%2C%22sd_src%22%3A%22https%3A%5C%2F%5C%2Ffbcdn-video-a-a.akamaihd.net%5C%2Fhvideo-ak-xaf1%5C%2Fv%5C%2Ft42.1790-2%5C%2F10463192_744029042321264_667496182_n.mp4%3Foh%3De58e9c10eb34e57202eacb9cf053907d%26oe%3D54515C3B%26__gda__%3D1414618436_6c4bf5a9696c2a7bc9e1d6d2031c975e%22%2C%22thumbnail_src%22%3A%22https%3A%5C%2F%5C%2Ffbcdn-vthumb-a.akamaihd.net%5C%2Fhvthumb-ak-xfa1%5C%2Fv%5C%2Ft15.0-10%5C%2F10549521_744029078987927_744028752321293_49060_1841_b.jpg%3Foh%3D04ca2eacb4c13c4f7fe93a0ac3c5d39a%26oe%3D54F762B6%26__gda__%3D1424481427_b36d5a76b5c644a2c08d22726efcf886%22%2C%22thumbnail_height%22%3A300%2C%22thumbnail_width%22%3A400%2C%22video_duration%22%3A100%2C%22video_id%22%3A%22744028752321293%22%2C%22subtitles_src%22%3Anull%7D%5D%2C%22show_captions_default%22%3Afalse%2C%22persistent_volume%22%3Atrue%2C%22buffer_length%22%3A0.1%7D&amp;width=520&amp;height=390&amp;user=653138652&amp;log=no&amp;div_id=id_54513f6f394db3a80901924&amp;swf_id=swf_id_54513f6f394db3a80901924&amp;browser=Firefox+36.0&amp;tracking_domain=https%3A%2F%2Fpixel.facebook.com&amp;post_form_id=&amp;string_table=https%3A%2F%2Fs-static.ak.facebook.com%2Fflash_strings.php%2Ft98236%2Fen_US" height="390" width="520">
      }
    };
  }
}

function requestYT(yt) {
  function setupFileLoadingService() {
    var oldCreateSessionMethod = Shumway.FileLoadingService.instance.createSession;
    Shumway.FileLoadingService.instance.createSession = function () {
      var session = oldCreateSessionMethod.apply(this, arguments);
      var oldOpenMethod = session.open;
      session.open = function (request) {
        if (request.url.indexOf('http://s.youtube.com/stream_204') === 0) {
          // No reason to send error report yet, let's keep it this way for now.
          // 204 means no response, so no data will be expected.
          console.error('YT_CALLBACK: ' + request.url);
          this.onopen && this.onopen();
          this.onclose && this.onclose();
          return;
        }
        oldOpenMethod.apply(this, arguments);
      };
      return session;
    };
  }

  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open('GET', 'http://www.youtube.com/watch?v=' + yt, true);
    xhr.onload = function (e) {

      var config = JSON.parse(/ytplayer\.config\s*=\s*(.+?);(<\/script|ytplayer)/.exec(xhr.responseText)[1]);
      // HACK removing FLVs from the fmt_list
      config.args.fmt_list = config.args.fmt_list.split(',').filter(function (s) {
        var fid = s.split('/')[0];
        return fid !== '5' && fid !== '34' && fid !== '35'; // more?
      }).join(',');

      setupFileLoadingService();

      var args = {};
      for (var i in config.args) {
        args[i] = String(config.args[i]);
      }
      resolve({url: config.url, args: args});
    };
    xhr.onerror = function () {
      reject(xhr.error);
    };
    xhr.send(null);
  });
}

var ShumwayCom = (function () {
  if (typeof SpecialPowers === 'undefined') {
    return undefined;
  }

  var Cc = SpecialPowers.Cc;
  var Ci = SpecialPowers.Ci;
  var Cu = SpecialPowers.Cu;
  var Cr = SpecialPowers.Cr;

  function SimpleStreamListener() {
    this.binaryStream = Cc['@mozilla.org/binaryinputstream;1']
      .createInstance(Ci.nsIBinaryInputStream);
    this.onData = null;
    this.buffer = null;
  }
  SimpleStreamListener.prototype = {
    QueryInterface: SpecialPowers.wrapCallback(function (iid) {
      if (iid.equals(Ci.nsIStreamListener) ||
        iid.equals(Ci.nsIRequestObserver) ||
        iid.equals(Ci.nsISupports))
        return this;
      throw Cr.NS_ERROR_NO_INTERFACE;
    }),
    onStartRequest: function (aRequest, aContext) {
      return Cr.NS_OK;
    },
    onStopRequest: function (aRequest, aContext, sStatusCode) {
      return Cr.NS_OK;
    },
    onDataAvailable: SpecialPowers.wrapCallback(function (aRequest, aContext, aInputStream, aOffset, aCount) {
      this.binaryStream.setInputStream(aInputStream);
      if (!this.buffer || aCount > this.buffer.byteLength) {
        this.buffer = new ArrayBuffer(aCount);
      }
      this.binaryStream.readArrayBuffer(aCount, this.buffer);
      this.onData(new Uint8Array(this.buffer, 0, aCount));
      return Cr.NS_OK;
    })
  };

  function SpecialInflate() {
    var listener = new SimpleStreamListener();
    listener.onData = function (data) {
      this.onData(data);
    }.bind(this);

    var converterService = Cc["@mozilla.org/streamConverters;1"].getService(Ci.nsIStreamConverterService);
    var converter = converterService.asyncConvertData("deflate", "uncompressed", listener, null);
    converter.onStartRequest(null, null);
    this.converter = converter;

    var binaryStream = Cc["@mozilla.org/binaryoutputstream;1"].createInstance(Ci.nsIBinaryOutputStream);
    var pipe = Cc["@mozilla.org/pipe;1"].createInstance(Ci.nsIPipe);
    pipe.init(true, true, 0, 0xFFFFFFFF, null);
    binaryStream.setOutputStream(pipe.outputStream);
    this.binaryStream = binaryStream;

    this.pipeInputStream = pipe.inputStream;

    this.onData = null;
  }
  SpecialInflate.prototype = {
    push: function (data) {
      this.binaryStream.writeByteArray(data, data.length);
      this.converter.onDataAvailable(null, null, this.pipeInputStream, 0, data.length);
    },
    close: function () {
      this.binaryStream.close();
      this.converter.onStopRequest(null, null, Cr.NS_OK);
    }
  };

  return {
    createSpecialInflate: function () {
      return new SpecialInflate();
    }
  };
})();
