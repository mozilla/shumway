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

// Very simplified botio command runner (for local testing purpose).

var path = require('path');
require('shelljs/global');

if (process.argv.length < 3) {
  console.log('USAGE: node botio <on_file.js>');
  process.exit(1);
}

// Botio will setup this variable.
process.env.BOTIO_MODULE = path.resolve('botioModuleStub.js');

var base = path.resolve('../..');
var cmd = path.resolve(process.argv[2]);
var botio_dir = path.resolve('./tmp');
var private_dir = path.join(botio_dir, 'private');
var public_dir = path.join(botio_dir, 'public');

// Botio will set the job information.
process.env.BOTIO_JOBINFO = JSON.stringify({
  public_dir: public_dir,
  private_dir: private_dir,
  public_url: 'http://localhost:8000/utils/botio/tmp/public'
});

// Clearing temp folder.
rm('-rf', botio_dir);
mkdir('-p', private_dir);
mkdir('-p', public_dir);
cd(private_dir);

var isMergeNeeded = cmd.indexOf('on_push.js') < 0;

// Cloning local repo and merging with mozilla/master
exec('git clone ' + base + ' .');
if (isMergeNeeded) {
  exec('git fetch https://github.com/mozilla/shumway.git master');
  exec('git merge FETCH_HEAD');
}

// Running the command.
exec(process.argv[0] + ' ' + cmd);
