package shunit {
    public var printSuccess = true;
    public function printEquals(actual: *, expected: *,
                                description: String) : void {
      if (actual != expected) {
        trace('FAIL: ' + description +
              '. expected: "' + expected + '", actual: "' + actual + '"');
      } else if (printSuccess) {
        trace('PASS: ' + description);
      }
    }

    public function printTruthy(value: *, description: String) : void {
      if (!value) {
        trace('FAIL: ' + description,
              '. expected: true(thy), actual: "' + value + '"');
      } else if (printSuccess) {
        trace('PASS: ' + description);
      }
    }
}
