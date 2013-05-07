package {
  namespace N0;
  namespace N1;
  namespace N2;
  namespace N3;
  namespace N4;
  namespace N5;
  namespace N6;
  namespace N7;
  namespace N8;
  namespace N9;

  public class C {
    N9 var x = 9;
  }

  var count = 1000 * 1000;

  (function () {
    use namespace N0;
    use namespace N1;
    use namespace N2;
    use namespace N3;
    use namespace N4;
    use namespace N5;
    use namespace N6;
    use namespace N7;
    use namespace N8;
    use namespace N9;
    trace("--- SET PROPERTY ---");
    var o = new C();

    for (var i = 0; i < count; i++) {
      o.x = i;
    }
    trace(o.x);
  })();
}
