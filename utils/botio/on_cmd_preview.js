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

echo('Preparing');
exec('make install-libs');
exec('make BASE=' + shumwayConfig.shumwayBase + ' link-utils');

echo('Publishing');
exec('grunt web --sha1=true --threads=' + shumwayConfig.threads);

// Recursively copy all files into public directory
cp('-R', 'build/web/*', botio.public_dir);

botio.message('#### Published');
botio.message('You can view your repo files at: ' + botio.public_url + '/index.html');
