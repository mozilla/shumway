package {

  interface IA {
    function fa();
  }

  interface IB extends IA {
    function fb();
  }

  interface IC extends IA, IB {
    function fc();
  }

  interface ID extends IA, IB, IC {
    function fd();
  }

  class X implements ID {
    public function fa() { trace("fa"); }
    public function fb() { trace("fb"); }
    public function fc() { trace("fc"); }
    public function fd() { trace("fd"); }
  }

  class Y implements IA, IB, IC, ID {
    public function fa() { trace("fa"); }
    public function fb() { trace("fb"); }
    public function fc() { trace("fc"); }
    public function fd() { trace("fd"); }
  }

  var a : IA = new X();
  var b : IB = new X();
  var c : IC = new X();
  var d : ID = new X();
  var x = new X();

  a.fa();
  b.fa(); b.fb();
  c.fa(); c.fb(); c.fc();
  d.fa(); d.fb(); d.fc(); d.fd();
  x.fa(); x.fb(); x.fc(); x.fd();

  trace("--");

  var e : IA = new Y();
  var f : IB = new Y();
  var g : IC = new Y();
  var h : ID = new Y();
  var y = new Y();

  e.fa();
  f.fa(); f.fb();
  g.fa(); g.fb(); g.fc();
  h.fa(); h.fb(); h.fc(); h.fd();

  trace("-- Type Checking --");

  trace (x is IA);
  trace (x is IB);
  trace (x is IC);
  trace (x is ID);

  trace (y is IA);
  trace (y is IB);
  trace (y is IC);
  trace (y is ID);

  trace("-- DONE --");
}
