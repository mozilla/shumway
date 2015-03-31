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

// Botio module for command runner (see botio.js).

var messages = [];
exports.message = function (msg) {
  msg = msg || '';
  messages.push(msg);
  console.log('botio: ' + msg);
};

// Place all job information as exported vars.
var jobInfo = JSON.parse(process.env['BOTIO_JOBINFO']);
for (var key in jobInfo) {
  exports[key] = jobInfo[key];
}

process.on('exit', function() {
  // Print summary at the end.
  console.log('=-=-=-=-=-=-=-=-=-=-');
  messages.forEach(function (msg) {
    console.log(msg);
  })
});
