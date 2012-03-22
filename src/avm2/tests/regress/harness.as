function checkEqual(expect, actual) {
  //  because ( NaN == NaN ) always returns false, need to do
  //  a special compare to see if we got the right result.
  if ( actual != actual ) {
    if ( typeof actual == "object" ) {
      actual = "NaN object";
    } else {
      actual = "NaN number";
    }
  }
  if ( expect != expect ) {
    if ( typeof expect == "object" ) {
      expect = "NaN object";
    } else {
      expect = "NaN number";
    }
  }
  trace("actual: " + actual);
  trace("expect: " + expect);

  var passed="";
  if (expect == actual) {
    if ( typeof(expect) != typeof(actual)  &&
         ! ( ( typeof(expect)=="float" && typeof(actual)=="number")
             || ( typeof(actual)=="float" && typeof(expect)=="number")
           )
       ){
      passed = "type error";
    } else {
      passed = "true";
    }
  } else { //expect != actual
    passed = "false";
    // if both objects are numbers
    // need to replace w/ IEEE standard for rounding
    if (typeof(actual) == "number" && typeof(expect) == "number") {
      if ( Math.abs(actual-expect) < 0.0000001 ) {
        passed = "true";
      }
    }
    // If both objects are float, check that the values are the same
    // within 7 digits of precision.
    // log_10(2^24) ie 24 bits gives 7.2 digits of decimal precision
    if (typeof(actual) == "float" && typeof(expect) == "float") {
      if ( float.abs(actual-expect) < float(0.000001) ) {
        passed = "true";
      }
    }
  }
  return passed;
}

function test(name, expect, actual) {
  trace(name + ", expected: " + expect + ", actual: " + actual + ", " + checkEqual(expect, actual));
}
