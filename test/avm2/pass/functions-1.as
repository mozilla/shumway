package {

function foo() {
  /*
  (function f0() {})();
  (function f1() {})();
  (function f2() {})();
  (function f3() {})();
  (function f4() {})();
  (function f5() {})();
  (function f6() {})();
  (function f7() {})();
  */
}

(function () {
  trace("--- 0 ---");
  var x = 0;
  for (var i = 0; i < 30; i++) {
    // foo();
    x ++;
  }
  trace(x);
})();

}
