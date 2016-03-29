function foo() {
  trace(42);
  trace(0/0);
  trace(1/0);
  trace(-1/0);
}

foo();