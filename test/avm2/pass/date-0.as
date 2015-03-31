function traceDate(d, precise = true) {
  var s = d.getFullYear() + " " +
          d.getMonth() + " " +
          d.getDate() + " " +
          d.getDay() + " " +
          d.getHours();
  if (precise) { // Don't print precise date to make sure tests don't fail because of timing.
    s += " " + d.getMinutes() + " " + d.getSeconds() + " " + d.getMilliseconds();
  }
  trace(s);
}

function traceDateAll(d) {
  trace("getUTCFullYear: " + d.getUTCFullYear());
  trace("getUTCMonth(): " + d.getUTCMonth());
  trace("getUTCDate(): " + d.getUTCDate());
  trace("getUTCDay(): " + d.getUTCDay());
  trace("getUTCHours(): " + d.getUTCHours());
  trace("getUTCMinutes(): " + d.getUTCMinutes());
  trace("getUTCSeconds(): " + d.getUTCSeconds());
  trace("getUTCMilliseconds(): " + d.getUTCMilliseconds());
  trace("getFullYear(): " + d.getFullYear());
  trace("getMonth(): " + d.getMonth());
  trace("getDate(): " + d.getDate());
  trace("getDay(): " + d.getDay());
  trace("getHours(): " + d.getHours());
  trace("getMinutes(): " + d.getMinutes());
  trace("getSeconds(): " + d.getSeconds());
  trace("getMilliseconds(): " + d.getMilliseconds());
  trace("getTimezoneOffset(): " + d.getTimezoneOffset());
  trace("getTime(): " + d.getTime());
}

(function () {
  traceDate(new Date(), false);
  traceDate(new Date(1));
  traceDate(new Date(1, 2));
  traceDate(new Date(1, 2, 3));
  traceDate(new Date(1, 2, 3, 4));
  traceDate(new Date(1, 2, 3, 4, 5));
  traceDate(new Date(1, 2, 3, 4, 5, 6));
  traceDate(new Date(1, 2, 3, 4, 5, 6, 7));
})();

(function () {
  traceDateAll(new Date(2015, 2));
  traceDateAll(new Date(2015, 2, 3));
  traceDateAll(new Date(2015, 2, 3, 4));
  traceDateAll(new Date(2015, 2, 3, 4, 5));
  traceDateAll(new Date(2015, 2, 3, 4, 5, 6));
  traceDateAll(new Date(2015, 2, 3, 4, 5, 6, 7));
})();

(function () {
  var d = new Date(2015, 2, 3, 4, 5, 6, 7);
  // Empty versions fail in the JS engine with NaN.
  d.setFullYear(2010); trace(d.getTime());
  d.setFullYear(2010, 1); trace(d.getTime());
  d.setFullYear(2010, 1, 1); trace(d.getTime());

  d.setMonth(4); trace(d.getTime());
  d.setMonth(4, 5); trace(d.getTime());

  d.setDate(5); trace(d.getTime());

  d.setHours(1); trace(d.getTime());
  d.setHours(1, 2); trace(d.getTime());
  d.setHours(1, 2, 3); trace(d.getTime());
  d.setHours(1, 2, 3, 4); trace(d.getTime());

  d.setMinutes(3); trace(d.getTime());
  d.setMinutes(4, 5); trace(d.getTime());
  d.setMinutes(5, 6, 7); trace(d.getTime());

  d.setSeconds(32); trace(d.getTime());
  d.setSeconds(42, 21); trace(d.getTime());

  d.setMilliseconds(42); trace(d.getTime());

  d.setUTCFullYear(2000); trace(d.getTime());
  d.setUTCFullYear(2000, 1); trace(d.getTime());
  d.setUTCFullYear(2000, 5); trace(d.getTime());

  d.setUTCMonth(6); trace(d.getTime());
  d.setUTCMonth(6, 7); trace(d.getTime());

  d.setUTCDate(2); trace(d.getTime());

  d.setUTCHours(1); trace(d.getTime());
  d.setUTCHours(1, 2); trace(d.getTime());
  d.setUTCHours(1, 2, 3); trace(d.getTime());
  d.setUTCHours(1, 2, 3, 4); trace(d.getTime());

  d.setUTCMinutes(3); trace(d.getTime());
  d.setUTCMinutes(3, 4); trace(d.getTime());
  d.setUTCMinutes(4, 5, 6); trace(d.getTime());

  d.setUTCSeconds(32); trace(d.getTime());
  d.setUTCSeconds(32, 32); trace(d.getTime());

  d.setUTCMilliseconds(123); trace(d.getTime());


  d.fullYear = 1234; trace(d.fullYear);
  d.month = 3; trace(d.month);
  d.date = 12; trace(d.date);
  d.hours = 3; trace(d.hours);
  d.minutes = 22; trace(d.minutes);
  d.seconds = 44; trace(d.seconds);
  d.milliseconds = 1234; trace(d.milliseconds);
  d.fullYearUTC = 1234; trace(d.fullYearUTC);
  d.monthUTC = 3; trace(d.monthUTC);
  d.dateUTC = 3; trace(d.dateUTC);
  d.hoursUTC = 4; trace(d.hoursUTC);
  d.minutesUTC = 5; trace(d.minutesUTC);
  d.secondsUTC = 6; trace(d.secondsUTC);

  d.millisecondsUTC = 332; trace(d.millisecondsUTC);
  d.time = 1234; trace(d.time);
  trace(d.timezoneOffset);
  trace(d.day);
  trace(d.dayUTC);

})();