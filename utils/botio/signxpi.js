var jwt = require('jsonwebtoken');
var https = require('https');
var fs = require('fs');
var path = require('path');
var url = require('url');
var spawn = require('child_process').spawn;

var config = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'amo.json')).toString());
var host = config.host;

function issueToken() {
  var issuedAt = Math.floor(Date.now() / 1000);
  var payload = {
    iss: config.issuer,
    jti: Math.random().toString(),
    iat: issuedAt,
    exp: issuedAt + 60,
  };

  var token = jwt.sign(payload, config.secret, {
    algorithm: 'HS256',
  });
  return token;
}

function parseInstallRdf(xpiPath, callback) {
  var child = spawn('unzip', ['-p', path.resolve(xpiPath), 'install.rdf']);
  var content = '';
  child.stdout.on('data', function (chunk) {
    content += chunk;
  });
  child.on('close', function (code) {
    if (code != 0) {
      callback('invalid return code from unzip');
      return;
    }
    var m = /<em:id>([^<]+)/.exec(content);
    if (!m) {
      callback('addon id was not found');
      return;
    }
    var id = m[1];
    m = /<em:version>([^<]+)/.exec(content);
    if (!m) {
      callback('addon version was not found');
      return;
    }
    var version = m[1];
    callback(null, {id: id, version: version});
  });
}

function sendXpi(buffer, addonId, version, callback) {
  // PUT /api/v3/addons/[string:add-on-id]/versions/[string:version]/
  var boundary = '---------------------------';
  boundary += Math.floor(Math.random() * 32768);
  boundary += Math.floor(Math.random() * 32768);
  boundary += Math.floor(Math.random() * 32768);
  var header = '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="upload"; filename="file.xpi"\r\n\r\n';
  var footer = '\r\n--' + boundary + '--\r\n';
  var response = '', statusCode = 0;
  var req = https.request({
    hostname: host,
    path: '/api/v3/addons/' + addonId + '/versions/' + version + '/',
    method: 'put',
    headers: {
      'Authorization': 'JWT ' + issueToken(),
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': header.length + buffer.length + footer.length
    }
  }, function (res) {
    statusCode = res.statusCode;
    res.on('data', function (chunk) {
      response += chunk;
    });
    res.on('end', function (err) {
      callback(err, statusCode, response);
    });
  });
  req.on('error', function (err) {
    callback(err)
  });
  req.write(header);
  req.write(buffer);
  req.write(footer);
  req.end();
}


function pollStatus(statusUrl, callback) {
  console.log('Polling status at ' + statusUrl);
  var options = url.parse(statusUrl);
  options.headers = {
    'Authorization': 'JWT ' + issueToken()
  };
  var response = '', statusCode = 0;
  var req = https.get(options, function (res) {
    statusCode = res.statusCode;
    res.on('data', function (chunk) {
      response += chunk;
    });
    res.on('end', function (err) {
      callback(err, statusCode, response);
    });
  });
  req.on('error', function (err) {
    callback(err)
  });
}

var timeout = +config.timeout || 5 * 60 * 1000; // default 5 min
var interval = +config.interval || 30 * 1000; // default 30 sec
var xpiPath = process.argv[2];
var outputXpiPath = process.argv[3] || xpiPath;
var statusUrl;
var stopAt = Date.now() + timeout;
console.log('Preparing request for ' + xpiPath);
parseInstallRdf(xpiPath, function (err, info) {
  if (err) {
    console.error('Unable to parse XPI: ' + err);
    process.exit(1);
  }

  console.log('Sending request: ' + info.id + ' v' + info.version);
  var content = fs.readFileSync(xpiPath);
  sendXpi(content, info.id, info.version, function (err, statusCode, response) {
    if (err || (statusCode != 201 && statusCode != 202)) {
      console.error('Unexpected error during XPI sending: ' + statusCode + ' ' + err);
      process.exit(2);
    }
    var status = JSON.parse(response);
    statusUrl = status.url;
    pollStatus(statusUrl, processStatus);
  });
});

function processStatus(err, statusCode, response) {
  if (err || statusCode !== 200) {
    console.error('Unexpected error during status update: ' + statusCode + ' ' + err);
    process.exit(3);
  }
  var status = JSON.parse(response);
  if (status.files.length > 0 && status.files[0].signed) {
    downloadFile(status.files[0].download_url, false);
    return;
  }
  if (Date.now() >= stopAt) {
    console.error('Timeout -- stopping');
    process.exit(4);
  }
  setTimeout(function () {
    pollStatus(statusUrl, processStatus);
  }, interval);
}

function downloadFile(downloadUrl, mirror) {
  console.log('Downloading from: ' + downloadUrl);
  var options = url.parse(downloadUrl);
  if (!mirror) {
    options.headers = {
      'Authorization': 'JWT ' + issueToken()
    };
  }
  var response = '';
  var req = https.get(options, function (res) {
    var statusCode = res.statusCode;
    if (statusCode == 302) {
      downloadFile(res.headers.location, true);
      return;
    }
    if (statusCode != 200) {
      console.error('Unable to download: ' + statusCode);
      process.exit(5);
    }
    res.setEncoding('binary');
    res.on('data', function (chunk) {
      response += chunk;
    });
    res.on('end', function (err) {
      console.log('Saving to ' + outputXpiPath);
      fs.writeFileSync(outputXpiPath, response, 'binary');
      process.exit(0);
    });
  });
  req.on('error', function (err) {
    console.error('Unable to download: ' + err);
    process.exit(5);
  });
}
