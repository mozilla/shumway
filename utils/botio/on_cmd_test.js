/*
 * Copyright 2015 Mozilla Foundation
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

var botio = require(process.env['BOTIO_MODULE']);
require('shelljs/global');

var shumwayConfig = require(__dirname + '/shumwayConfig.js');

var start = Date.now();

echo('Preparing');
exec('make BASE=' + shumwayConfig.shumwayBase + ' link-utils');
exec('npm install');

var result = exec('grunt build --sha1=true --threads=' + shumwayConfig.threads);
if (!result || result.code) {
  botio.message('+ **Build:** FAILED');
  exit(1);
}

cp(shumwayConfig.shumwayBase + '/test/resources/browser_manifests/browser_manifest.json',
   'test/resources/browser_manifests/browser_manifest.json');
cp('-R', shumwayConfig.shumwayBase + '/test/ref', 'test/');

echo('Running');
if (shumwayConfig.xvfbRunner) {
  exec(shumwayConfig.xvfbRunner);
  process.env.DISPLAY = shumwayConfig.xvfbDisplay;
}

var fail = false;
var tests = [
['grunt lint', function (error, output) {
  var lintIsOkay = output.match(/SUCCESS: no lint errors/g);
  if (lintIsOkay) {
    botio.message('+ **Lint:** Passed');
  } else {
    botio.message('+ **Lint:** FAILED');
    fail = true;
  }
  botio.message();
}],
['grunt reftest --bundle=true --noPrompts=true', function (error, output) {
  var regressionSuccess = output.match(/All regression tests passed/g);
  if (regressionSuccess) {
    botio.message('+ **Reference tests:** Passed');
  } else {
    botio.message('+ **Reference tests:** FAILED');
    fail = true;
  }
  botio.message();

  if (!regressionSuccess) {
    cp('test/reftrace.log', botio.public_dir);
    if (/  failed stas:/.test(output)) {
      botio.message('  + Trace log: ' + botio.public_url + '/reftrace.log');
    }
    cp('test/eq.log', botio.public_dir); 
    cp('-R', 'test/resources', botio.public_dir);
    cp('-R', 'test/test_snapshots', botio.public_dir);
    if (/  different ref\/snapshot:/.test(output)) {
      botio.message('  + Reference images: ' + botio.public_url + '/resources/reftest-analyzer.html#web=../eq.log');
    }
    if (/ has not responded in /.test(output)) {
      botio.message('  + Failure: one or more browser hung, see output.txt');
    }
    botio.message();
  }
}],
['grunt tracetest --threads=1', function (error, output) {
  var regressionSuccess = output.match(/All trace tests pass/g);
  if (regressionSuccess) {
    botio.message('+ **Trace tests:** Passed');
  } else {
    botio.message('+ **Trace tests:** FAILED');
    fail = true;
  }
  botio.message();

  if (!regressionSuccess) {
    cp('test/trace.log', botio.public_dir);
    botio.message('  + Trace log: ' + botio.public_url + '/trace.log');
    botio.message();
  }
}],
['grunt exec:test_avm2_acceptance', function (error, output) {
  var regressionSuccess = output.match(/Done, without errors./g);
  if (regressionSuccess) {
    botio.message('+ **AVM2 tests:** Passed');
  } else {
    botio.message('+ **AVM2 tests:** FAILED');
    fail = true;
  }
  botio.message();
}],
['grunt tracetest-swfdec --threads=3', function (error, output) {
  var regressionSuccess = output.match(/SUCCESS: All trace tests pass./g);
  if (regressionSuccess) {
    botio.message('+ **AVM1 trace tests:** Passed');
  } else {
    botio.message('+ **AVM1 trace tests:** FAILED');
    fail = true;
  }
  botio.message();
}],
['grunt exec:test_avm2_ats', function (error, output) {
  if (!error) {
    botio.message('+ **AVM2 ATS tests:** Passed');
  } else {
    botio.message('+ **AVM2 ATS tests:** FAILED');
    fail = true;
  }
  botio.message();
}],
['grunt perf', function (error, output) {
  if (!error) {
    botio.message('+ **Perf tests:** Passed');
  } else {
    botio.message('+ **Perf tests:** FAILED');
    fail = true;
  }
  botio.message();
}]
];

function runNext() {
  if (tests.length === 0) {
    if (fail)
      exit(1);
    return;
  }
  var task = tests.shift();
  var taskStart = Date.now();
  console.log('Start: ' + (taskStart - start));
  exec(task[0], {async:true,silent:false}, function() {
    task[1].apply(null, arguments);
    var taskEnd = Date.now();
    console.log('End: ' + (taskEnd - start) + ', took: ' + (taskEnd - taskStart));
    runNext();
  });
}
runNext();
