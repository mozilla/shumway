(function flashNetTests() {
  /*
  var URLLoader = flash.net.URLLoader;
   */

  function log(message) {
    info(message);
  }

  unitTests.push(function URLVariablesTest() {
    var URLVariables = Shumway.AVM2.AS.flash.net.URLVariables;

    log("--- flash.net.URLVariables ---");
    var f = new URLVariables("fn=Gordon&ln=Shumway");
    check (f.toString() === "fn=Gordon&ln=Shumway");
    f.decode("fn=Mozilla&ln=Firefox");
    log(f.toString());
    check (f.toString() === "fn=Gordon&fn=Mozilla&ln=Shumway&ln=Firefox");
    f = new URLVariables();
    f[Multiname.getPublicQualifiedName("x")] = 123;
    check (f.toString() === "x=123");
  });

  unitTests.push(function URLRequestTest() {
    var URLRequest = Shumway.AVM2.AS.flash.net.URLRequest;
    var URLRequestHeader = Shumway.AVM2.AS.flash.net.URLRequestHeader;

    log("--- flash.net.URLRequest ---");
    var request = new URLRequest();
    check(request.contentType === "application/x-www-form-urlencoded");
    check(request.data === null);
    check(request.digest === null);
    check(request.method === "GET");
    check(request.requestHeaders && request.requestHeaders.length === 0);
    check(request.url === null);

    var request = new URLRequest('http://example.com/');
    request.requestHeaders = [new URLRequestHeader('header', 'value')];
    request.method = "POST";
    check(request.url === 'http://example.com/');
    check(request.requestHeaders && request.requestHeaders.length === 1);
    check(request.requestHeaders[0].axGetPublicProperty('name') === 'header');
    check(request.requestHeaders[0].axGetPublicProperty('value') === 'value');
    check(request.method = "POST");
  });

  unitTests.push(function URLStreamTest() {
    var URLRequest = Shumway.AVM2.AS.flash.net.URLRequest;
    var URLStream = Shumway.AVM2.AS.flash.net.URLStream;
    var Event = Shumway.AVM2.AS.flash.events.Event;
    var ByteArray = Shumway.AVM2.AS.flash.utils.ByteArray;

    return new Promise(function (resolve, reject) {
      log("--- flash.net.URLStream ---");
      var stream = new URLStream();
      check(stream.connected === false);

      check(stream.endian === 'bigEndian');
      stream.endian = 'littleEndian';
      check(stream.endian === 'littleEndian');
      stream.endian = 'bigEndian';
      check(stream.endian === 'bigEndian');

      var request = new URLRequest('../image-loading/firefox.png');
      var stream = new URLStream();
      var openEventPromise = new Promise(function (resolve, reject) {
        stream.addEventListener(Event.OPEN, function () {
          try {
            check(stream.connected === true);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
      var completeEventPromise = new Promise(function (resolve, reject) {
        stream.addEventListener(Event.COMPLETE, function () {
          try {
            check(stream.connected === false);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });

      stream.load(request);

      var timeout = setTimeout(function () {
        reject('timeout');
      }, 1000);

      Promise.all([openEventPromise, completeEventPromise]).then(function () {
        clearTimeout(timeout);
        check(stream.bytesAvailable > 20);
        var b = stream.readByte();
        check(b === 0x89);
        var result = new ByteArray();
        stream.readBytes(result, 0, 9);
        check(result.length === 9);
        check(result.axGetPublicProperty(0) === 0x50);
        check(result.axGetPublicProperty(1) === 0x4E);
        var short = stream.readUnsignedShort();
        check(short === 0x000D);
        var str = stream.readUTFBytes(4);
        check(str === 'IHDR');
      }, function (e) {
        clearTimeout(timeout);
        throw e;
      }).then(resolve, reject);
    });
  });

  unitTests.push(function URLLoaderTest() {
    var URLRequest = Shumway.AVM2.AS.flash.net.URLRequest;
    var URLLoader = Shumway.AVM2.AS.flash.net.URLLoader;
    var Event = Shumway.AVM2.AS.flash.events.Event;
    var ByteArray = Shumway.AVM2.AS.flash.utils.ByteArray;

    log("--- flash.net.URLLoader ---");
    var loader = new URLLoader();
    check(loader.dataFormat === 'text');

    var binaryLoadPromise = new Promise(function (resolve, reject) {
      function loader_complete() {
        clearTimeout(timeout);
        try {
          var data = loader.data;
          check(ByteArray.isInstanceOf(data));
          check(data.length > 20);
          check(data.axGetPublicProperty(1) === 0x50);
          resolve();
        } catch (e) {
          reject(e);
        }
      }

      var request = new URLRequest('../image-loading/firefox.png');
      var loader = new URLLoader();
      loader.dataFormat = 'binary';
      loader.addEventListener(Event.COMPLETE, loader_complete);
      loader.load(request);
      var timeout = setTimeout(function () {
        reject('timeout');
      }, 1000);
    });

    var textLoadPromise = new Promise(function (resolve, reject) {
      function loader_complete() {
        clearTimeout(timeout);
        try {
          var data = loader.data;
          check(typeof data === 'string');
          check(data.indexOf('Apache') >= 0);
          resolve();
        } catch (e) {
          reject(e);
        }
      }

      var request = new URLRequest('../../LICENSE');
      var loader = new URLLoader();
      loader.addEventListener(Event.COMPLETE, loader_complete);
      loader.load(request);
      var timeout = setTimeout(function () {
        reject('timeout');
      }, 1000);
    });
    return Promise.all([textLoadPromise, binaryLoadPromise]);
  });

  unitTests.push(function NetConnectionTest() {
    var NetConnection = Shumway.AVM2.AS.flash.net.NetConnection;

    log("--- flash.net.NetConnection ---");
    check(NetConnection.defaultObjectEncoding === 3);

    var connection = new NetConnection();
    check(connection.uri === null);
    check(connection.connected === false);
    check(connection.client === null);
    check(connection.proxyType === 'none');
    check(connection.objectEncoding === 3);

    NetConnection.defaultObjectEncoding = 0;
    var connection = new NetConnection('http://example.com/');
    var client = {};
    connection.client = client;
    check(connection.client === client);
    check(connection.objectEncoding === 0);

  });
})();
