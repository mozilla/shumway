package {
  public class Selfref
  {
    public function Selfref()
    {
      method();
      trace('PASS');
    }

    public static function method():*
    {
    }

    {
      black = new Selfref();
    }

    public static var black:Selfref;
  }


  trace("-- DONE --");
}