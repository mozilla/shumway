function fn() {
  trace(arguments.callee === fn);
}
fn();
