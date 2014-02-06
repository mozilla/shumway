var fs = require('fs');
var spawn = require('child_process').spawn;

var manifest = JSON.parse(fs.readFileSync('manifest.json'));
var jstemplate = '' + fs.readFileSync('playerglobal.js.template');
var ascjar = '../utils/asc.jar';
var buildasc = './avm2/generated/builtin/builtin.abc';

function runAsc(files, callback) {
  var outputName = 'build_output';
  var args = ['-ea', '-DAS3', '-DAVMPLUS', '-classpath', ascjar,
              'macromedia.asc.embedding.ScriptCompiler', '-builtin',
              '-import', buildasc, '-out', outputName].concat(files);
  var outputPath = files[files.length - 1];
  outputPath = outputPath.substring(0, outputPath.lastIndexOf('/') + 1) + outputName + '.abc';
  var proc = spawn('java', args, {stdio: 'inherit'} );
  proc.on('close', function (code) {
    if (code) throw new Error('Compilation failed with code: ' + code);

    console.log(outputPath + ': ' + code);
    callback(outputPath);
  });
  
}

var i = 0;

function next() {
  if (i >= manifest.length) return complete();

  var item = manifest[i++];
  var files = item.files; delete item.files;
  runAsc(files, function (output) {
    var ascData = fs.readFileSync(output);
    item.ascHex = ascData.toString('hex');
    next();
  });
}

process.chdir('../../src');
next();


function complete() {
  var hex = '', lastPos = 0;
  manifest.forEach(function (item) {
    var ascHex = item.ascHex; delete item.ascHex;
    item.offset = lastPos;
    item.length = ascHex.length >> 1;
    lastPos += item.length;
    hex += ascHex;
  });
  fs.writeFileSync('flash/playerglobal-new.js',
    jstemplate.replace('[/*index*/]', JSON.stringify(manifest, null, 2)));
  fs.writeFileSync('flash/playerglobal-new.abc', new Buffer(hex, 'hex'));
}
