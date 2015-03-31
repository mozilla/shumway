(function () {
  var a = Array('<p>', undefined, 'p');
  trace(a.length);
  trace(a[0] + ',' + a[1] + ',' + a[2]);
  trace(a.join(','));
  trace(a.toString());
})();

trace("-- DONE --");
