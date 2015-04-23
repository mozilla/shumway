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
    print("eval(" + expr + ")");
    if (expr.indexOf('jwplayer.utils.tea.decrypt') >= 0) {
      return "<string></string>";
    } else if (expr.indexOf('jwplayer.embed.flash.getVars') >= 0) {
      var base = "XXX";
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