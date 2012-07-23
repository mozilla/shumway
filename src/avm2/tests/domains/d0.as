package Shumway {
  import flash.system.ApplicationDomain;
  import flash.display.Loader;
  import flash.system.LoaderContext;

  class A {
    function A() {
      trace("Domain 0: A");
    }
  }

  var domain: ApplicationDomain = new ApplicationDomain(ApplicationDomain.currentDomain);
  var context: LoaderContext = new LoaderContext(false, domain);
  var loader: Loader = new Loader();
  loader.load(new URLRequest("d1.swf"), context);
}