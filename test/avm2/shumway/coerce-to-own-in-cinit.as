package {

public class TestObject {
  public static var foo = {};
  {
    try {
      new TestObject(foo);
    } catch (e) {
      trace((e + '').substr(0, 60));
    }
  }
  function TestObject(test:TestObject) {
  }
}

}
