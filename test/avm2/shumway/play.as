package {
    public class Animal {
        static var count:int = 100;
        
        public var age:int;
        
        trace("Created Animal Class");
    }
    
    public class Monkey extends Animal {
        static var staticValue2:int;
        
        public var boo:int;
        
        trace("Created Monkey Class");
    }
    
    public class Human extends Monkey {
        trace("Creating Human Class");
        static public var staticValue3:int;
    
        public var name:String;
        public var profession:String;
        
        trace("Human::count" + count);
        trace("Created Human Class");
    }
     
    trace("Animal::count = " + Animal.count);
    
    trace("Human::count = " + Human.count);
}