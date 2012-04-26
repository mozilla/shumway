class TestCase {
  var sectionName;
  var reason;
  var expect;
  var actual;
  function TestCase(sectionName, reason, expect, actual) {
    this.sectionName = sectionName;
    this.reason = reason;
    this.expect = expect;
    this.actual = actual;
  }

  static function startTest() { }
  static function test(testCases) {
    var atLeastOneFailed = false;
    for (var i = 0; i < testCases.length; i++) {
      var tc = testCases[i];
      var failed = tc.expect !== tc.actual;
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
