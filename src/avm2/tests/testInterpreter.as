package {
    /*
    public class Object {}
    public class int {}
    public final class String extends Object {}
    
    */
    
    function foo() {
        var x = 42, y = 16, z = 0;
        function baz() { x++; }
        baz();
        function bin() { y++; }
        bin();
        trace(x + " " + y);
    }
    
    foo();
}