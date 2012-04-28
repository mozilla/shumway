class TestCase {
  var sectionName;
  var description;
  var reason;
  var expect;
  var actual;
  var failed;
  function TestCase(sectionName, description, expect, actual) {
    this.sectionName = sectionName;
    this.description = description;
    this.reason = '';
    this.expect = expect;
    this.actual = actual;
    this.failed = true;
  }

  static function startTest() { }
  static function test(testCases) {
    var atLeastOneFailed = false;
    for (var i = 0; i < testCases.length; i++) {
      var tc = testCases[i];
      var failed = !(tc.expect === tc.actual || (isNaN(tc.expect) && isNaN(tc.actual)));
      tc.failed = failed;
      log('Test case #' + i + ' | ' + tc.expect +
        (failed ? ' != ' : ' == ') + tc.actual +
        ' | ' + tc.sectionName + ' | ' + tc.reason);
      atLeastOneFailed |= failed;
    }
    if (atLeastOneFailed)
      log('FAILED!');
    _global.TestCaseResult = {
      failed: atLeastOneFailed,
      testCases: testCases
    };
  }
  static function writeHeaderToLog(s) {
    log('==== ' + s + ' ====');
  }
  static function log(s) {
    _global.trace(s);
  }
}
