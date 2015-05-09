var requiredConsoleFunctions = ["profile", "profileEnd", "markTimeline", "time", "timeEnd"];
for (var i = 0; i < requiredConsoleFunctions.length; i++) {
  if (!(requiredConsoleFunctions[i] in console))
    console[requiredConsoleFunctions[i]] = function () {};
}
if (typeof performance === 'undefined') {
  window.performance = { now: Date.now };
}
