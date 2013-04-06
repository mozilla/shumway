package {
/* ------------------------------------------------------------------ 
// Helper classes
------------------------------------------------------------------ */
	public class Integer {
		public var i:int;
		public function Integer(x:int = 0):void {
			i = x;
		}
		public function value():int {
			return i;
		}
	}

	public class SmallInteger extends Integer {
		public var si:int;
		public function SmallInteger(x:int = 0):void {
			si = x;
		}
		override public function value():int {
			return si;
		}
	}

	public class BigInteger extends Integer {
		public var bi:int;
		public function BigInteger(x:int = 0):void {
			bi = x;
		}
		override public function value():int {
			return bi;
		}
	}

	public class FakeInteger {
		public var fi:int;
		public function FakeInteger(x:int = 0):void {
			fi = x;
		}
		public function value():int {
			return fi;
		}
	}
/*------------------------------------------------------------------
// Case: Vector.<Object> set property
------------------------------------------------------------------ */
	function boo() {
		trace("boo:"); 

		var vector:Vector.<Integer> = new Vector.<Integer>(7);
 
		var bi0:BigInteger = new BigInteger(100);
		var bi1:BigInteger = new BigInteger(101);
		var bi2:BigInteger = new BigInteger(102);

		vector[0] = bi0;
		vector[1] = bi1;
		vector[2] = bi2;		
		
		trace(	vector[0].value() + " " 
			  + vector[1].value() + " " 
  			  + vector[2].value());


		var si0:SmallInteger = new SmallInteger(103);
		var si1:SmallInteger = new SmallInteger(104);
		var si2:SmallInteger = new SmallInteger(105);
		
		vector[3] = si0;	
		vector[4] = si1;
		vector[5] = si2;		

		trace(	vector[3].value() + " " 
			  + vector[4].value() + " " 
			  + vector[5].value());

	}

	boo();

/*------------------------------------------------------------------
// Case: Vector.<int> set property
------------------------------------------------------------------ */
	function woo() {
		trace("woo:");
		
		var vector:Vector.<int> = new Vector.<int>(3);
 
		vector[0] = 100;
		vector[1] = 101;
		vector[2] = 102;

		//for (var i = 0; i < v1.length; i++) {
		//	trace(v1[i]);
		//}

		trace(vector[0] + " " 
		  	+ vector[1] + " " 
		  	+ vector[2]);

	}
		
	woo();

/*------------------------------------------------------------------
// Case: Multidimensional (2D) Vector.<Vector.<int>> set property
------------------------------------------------------------------ */
	function moo2D() {
		trace("moo2D:");

		var vector:Vector.<Vector.<int>> = new Vector.<Vector.<int>>(3);
 
		vector[0] = new Vector.<int>(3);
		vector[1] = new Vector.<int>(3);
		vector[2] = new Vector.<int>(3);
		
		vector[0][0] = 100;
		vector[0][1] = 101;
		vector[0][2] = 102;

		trace(	vector[0][0] + " " 
			  + vector[0][1] + " " 
  			  + vector[0][2]
  			  );
	}
		
	moo2D();

/*------------------------------------------------------------------
// Case: Multidimensional (3D) Vector.<Vector.<Vector.<int>>> set property
------------------------------------------------------------------ */
	function moo3D() {
		trace("moo3D:"); 

		var vector:Vector.<Vector.<Vector.<int>>> = new Vector.<Vector.<Vector.<int>>>(3);
 
		vector[0] = new Vector.<Vector.<int>>(3);
		vector[1] = new Vector.<Vector.<int>>(3);
		vector[2] = new Vector.<Vector.<int>>(3);
		
		vector[0][0] = new Vector.<int>(3);
		vector[0][1] = new Vector.<int>(3);
		vector[0][2] = new Vector.<int>(3);

		vector[0][0][0] = 100;
		vector[0][0][1] = 101;
		vector[0][0][2] = 102;

		trace(	vector[0][0][0] + " " 
			  + vector[0][0][1] + " " 
  			  + vector[0][0][2]
  			  );
	}
		
	moo3D();

/*------------------------------------------------------------------

/*------------------------------------------------------------------
// Case: Multidimensional (3D) Vector.<Vector.<Vector.<uint>>> set property
------------------------------------------------------------------ */
	function moo3Du() {
		trace("moo3Du:"); 

		var vector:Vector.<Vector.<Vector.<uint>>> = new Vector.<Vector.<Vector.<uint>>>(3);
 
		vector[0] = new Vector.<Vector.<uint>>(3);
		vector[1] = new Vector.<Vector.<uint>>(3);
		vector[2] = new Vector.<Vector.<uint>>(3);
		
		vector[0][0] = new Vector.<uint>(3);
		vector[0][1] = new Vector.<uint>(3);
		vector[0][2] = new Vector.<uint>(3);

		vector[0][0][0] = 100;
		vector[0][0][1] = 101;
		vector[0][0][2] = 102;

		trace(	vector[0][0][0] + " " 
			  + vector[0][0][1] + " " 
  			  + vector[0][0][2]
  			  );
	}
		
	moo3Du();

/*------------------------------------------------------------------


/*------------------------------------------------------------------
// Case: function call(v:Vector.<int>)
------------------------------------------------------------------ */
	function loo(v:Vector.<int>):void {
		v[0] = 100;
		v[1] = 101;
		v[2] = 102;
	}

	function koo():void {
		trace("koo:"); 

		var vector:Vector.<int> = new Vector.<int>(7);
		
		loo(vector);

		trace(	vector[0] + " "
			  + vector[1] + " "
  			  + vector[2]);

	}

	koo();
	
/*------------------------------------------------------------------
// Case: var v:Vector.<int> = this.vec;
------------------------------------------------------------------ */
	public class Test {
	  
	  	public var vec:Vector.<int>;


	  	public function Test():void {
	  		this.vec = new Vector.<int>(7);
	  	}

		public function too():void {
			trace("too:"); 

			var vector:Vector.<int> = this.vec;
			
			vector[0] = 100;
			vector[1] = 101;
			vector[2] = 102;
			
			trace(	vector[0] + " "
		  		  + vector[1] + " "
  			  	  + vector[2]);
		}

		public function doo():void {
			trace("doo:");

			trace(	vec[0] + " "
		  		  + vec[1] + " "
  			  	  + vec[2]);
		}
	}

	var t:Test = new Test();

	t.too();
	t.doo();

} // package

