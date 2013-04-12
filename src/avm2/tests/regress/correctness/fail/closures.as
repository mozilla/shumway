package {
    class A {
    function A () {
        var s : String = 'foo:bar';
        var parts : Array = s.split(':');
        trace(parts[1].toString());
        function b(){};
    }
}
}
