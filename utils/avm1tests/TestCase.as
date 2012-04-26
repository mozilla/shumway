class TestCase {
  var sectionName;
  var testBody;
  var expected;
  var actual;
  function TestCase(sectionName, testBody, expected, actual) {
    this.sectionName = sectionName;
    this.testBody = testBody;
    this.expected = expected;
    this.actual = actual;
  }

  static function startTest() { }
  static function test(testCases) {
    var atLeastOneFailed = false;
    for (var i = 0; i < testCases.length; i++) {
      var tc = testCases[i];
      var failed = tc.expected !== tc.actual;
      log('Test case #' + i + ' | ' + tc.expected +
        (failed ? ' != ' : ' == ') + tc.actual +
        ' | ' + tc.sectionName + ' | ' + tc.testBody);
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
