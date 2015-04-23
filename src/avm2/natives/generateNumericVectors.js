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

var fs = require('fs');
var path = require('path');
var template = 'int32Vector.ts';
var filePath = path.join(__dirname + '/' + template);

fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data) {
  if (!err) {
    data = "/* THIS FILE WAS AUTOMATICALLY GENERATED FROM " + template + " */\n\n" + data;
    var uint32 = data.replace(/Int32Vector/g, "Uint32Vector").replace(/Int32Array/g, "Uint32Array").replace(/<int>/g, "<uint>");
    var float64 = data.replace(/Int32Vector/g, "Float64Vector").replace(/Int32Array/g, "Float64Array").replace(/<int>/g, "<Number>");

    fs.writeFile(__dirname + '/uint32Vector.ts', uint32, function (err) {
      if (!err) {
        console.log("Wrote uint32Vector.ts OK!");
      }
    });

    fs.writeFile(__dirname + '/float64Vector.ts', float64, function (err) {
      if (!err) {
        console.log("Wrote float64Vector.ts OK!");
      }
    });

  } else {
    console.log(err);
  }
});
