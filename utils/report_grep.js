/*
 Scans the stdin (from running Shumway shell tests) for particular
 string and prints SWF names that produced such output.
*/
if (scriptArgs.length === 0) {
  print('Usage: js utils/report_grep.js <string-to-find>');
  quit(1);
}

var search = scriptArgs[0];

var line;
var currentSwf;
var skipToNext = true;
while ((line = readline()) != null) {
  if (line.indexOf('RUNNING:') === 0) {
    currentSwf = line.substring('RUNNING:'.length).trim(); 
    skipToNext = false;
  }
  if (skipToNext) {
    continue;
  }
  if (line.indexOf(search) >= 0) {
    print(currentSwf);
    skipToNext = true;
  }
}

