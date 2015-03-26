/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Configuration for on_*.js scripts -- shall be modified in a production environment.

var path = require('path');

exports.shumwayBase = path.resolve('../../../..');

exports.threads = 9;

//exports.xvfbRunner = '';
//exports.xvfbDisplay = ':5';

//exports.buildWebRunner = "build-web.sh";
