/*
 * Copyright (c) 2003-2005  Tom Wu
 * All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * In addition, the following condition applies:
 *
 * All redistributions must retain an intact copy of this copyright notice
 * and disclaimer.
 */

package crypto {
	// Simple framework for running the benchmark suites and
	// computing a score based on the timing measurements.


	// A benchmark has a name (string) and a function that will be run to
	// do the performance measurement. The optional setup and tearDown
	// arguments are functions that will be invoked before and after
	// running the benchmark, but the running time of these functions will
	// not be accounted for in the benchmark score.
	class Benchmark {
	    public var name:String;
	    public var run:Function;
	    public var Setup:Function;
	    public var TearDown:Function;
	    public function Benchmark(name:String, run:Function, setup:Function=null, tearDown:Function=null) {
	        this.name = name;
	        this.run = run;
	        this.Setup = setup ? setup : new Function();
	        this.TearDown = tearDown ? tearDown : new Function();
	    }
	}


	// Benchmark results hold the benchmark and the measured time used to
	// run the benchmark. The benchmark score is computed later once a
	// full benchmark suite has run to completion.
	class BenchmarkResult {
	    private var benchmark:Benchmark;
	    private var time:Number;
	    public function BenchmarkResult(benchmark:Benchmark, time:Number):void {
	        this.benchmark = benchmark;
	        this.time = time;
	    }

	    // Automatically convert results to numbers. Used by the geometric
	    // mean computation.
	    public function valueOf():Number {
	      return this.time;
	    }
	}




	// Suites of benchmarks consist of a name and the set of benchmarks in
	// addition to the reference timing that the final score will be based
	// on. This way, all scores are relative to a reference run and higher
	// scores implies better performance.
	class BenchmarkSuite {

	    // Keep track of all declared benchmark suites.
	    static var suites:Array = [];

	    // Scores are not comparable across versions. Bump the version if
	    // you're making changes that will affect that scores, e.g. if you add
	    // a new benchmark or change an existing one.
	    public var version:String = '5';
	    private var name:String;
	    private var reference:Number;
	    private var benchmarks:Array;
	    private var results:Array;
	    private var runner;
	    static private var scores:Array;

	    public function BenchmarkSuite(name:String, reference:Number, benchmarks:Array):void {
	        this.name = name;
	        this.reference = reference;
	        this.benchmarks = benchmarks;
	        BenchmarkSuite.suites.push(this);
	    }

	    // Runs all registered benchmark suites and optionally yields between
	    // each individual benchmark to avoid running for too long in the
	    // context of browsers. Once done, the final score is reported to the
	    // runner.
	    public static function RunSuites(runner):void {
	        var continuation = null;
	        var length:int = suites.length;
	        BenchmarkSuite.scores = [];
	        var index:int = 0;
	        function RunStep() {
	            while (continuation || index < length) {
	                if (continuation) {
	                    continuation = continuation();
	                } else {
	                    var suite = suites[index++];
	                    if (runner.NotifyStart) runner.NotifyStart(suite.name);
	                    continuation = suite.RunStep(runner);
	                }
	                if (continuation && typeof window != 'undefined' && window.setTimeout) {
	                    window.setTimeout(RunStep, 25);
	                    return;
	                }
	            }
	            if (runner.NotifyScore) {
	                var score = BenchmarkSuite.GeometricMean(BenchmarkSuite.scores);
	                var formatted = BenchmarkSuite.FormatScore(100 * score);
	                runner.NotifyScore(formatted);
	            }
	        }
	        RunStep();
	    }

	    // Counts the total number of registered benchmarks. Useful for
	    // showing progress as a percentage.
	    public function CountBenchmarks() {
	        var result:Number = 0;
	        for (var i:int = 0; i < suites.length; i++) {
	            result += suites[i].benchmarks.length;
	        }
	        return result;
	    }

	    // Computes the geometric mean of a set of numbers.
	    public static function GeometricMean (numbers:Array):Number {
	        var log:Number = 0;
	        for (var i:int = 0; i < numbers.length; i++) {
	            log += Math.log(numbers[i]);
	        }
	        return Math.pow(Math.E, log / numbers.length);
	    }

	    // Converts a score value to a string with at least three significant
	    // digits.
	    public static function FormatScore(value:Number):Number {
	        if (value > 100) {
	            return value.toFixed(0);
	        } else {
	            return value.toPrecision(3);
	        }
	    }

	    // Notifies the runner that we're done running a single benchmark in
	    // the benchmark suite. This can be useful to report progress.
	    public function NotifyStep(result:*):void {
	        this.results.push(result);
	        if (this.runner.NotifyStep) this.runner.NotifyStep(result.benchmark.name);
	    }

	    // Notifies the runner that we're done with running a suite and that
	    // we have a result which can be reported to the user if needed.
	    public function NotifyResult():void {
	        var mean:Number = BenchmarkSuite.GeometricMean(this.results);
	        var score:Number = this.reference / mean;
	        BenchmarkSuite.scores.push(score);
	        if (this.runner.NotifyResult) {
	            var formatted = BenchmarkSuite.FormatScore(100 * score);
	            this.runner.NotifyResult(this.name, formatted);
	        }
	    }


	    // Notifies the runner that running a benchmark resulted in an error.
	    public function NotifyError(error:*):void {
	        if (this.runner.NotifyError) {
	            this.runner.NotifyError(this.name, error);
	        }
	        if (this.runner.NotifyStep) {
	            this.runner.NotifyStep(this.name);
	        }
	    }

	    // Runs a single benchmark for at least a second and computes the
	    // average time it takes to run a single iteration.
	    public function RunSingleBenchmark(benchmark:Benchmark):void {
	        var elapsed:int = 0;
	        var start:int = new Date();
	        for (var n:int = 0; elapsed < 1000; n++) {
	            benchmark.run();
	            elapsed = new Date() - start;
	        }
	        var usec:int = (elapsed * 1000) / n;
	        this.NotifyStep(new BenchmarkResult(benchmark, usec));
	    }

	    // This function starts running a suite, but stops between each
	    // individual benchmark in the suite and returns a continuation
	    // function which can be invoked to run the next benchmark. Once the
	    // last benchmark has been executed, null is returned.
	    public function RunStep(runner):Function {
	        this.results = [];
	        this.runner = runner;
	        var length = this.benchmarks.length;
	        var index = 0;
	        var suite = this;
	        function RunNextSetup() {
	            if (index < length) {
	                try {
	                    suite.benchmarks[index].Setup();
	                } catch (e) {
	                    suite.NotifyError(e);
	                    return null;
	                }
	                return RunNextBenchmark;
	            }
	            suite.NotifyResult();
	            return null;
	        }

	        function RunNextBenchmark() {
	            try {
	                suite.RunSingleBenchmark(suite.benchmarks[index]);
	            } catch (e) {
					print(e)
	                suite.NotifyError(e);
	                return null;
	            }
	            return RunNextTearDown;
	        }

	        function RunNextTearDown() {
	            try {
	                suite.benchmarks[index++].TearDown();
	            } catch (e) {
	                suite.NotifyError(e);
	                return null;
	            }
	        return RunNextSetup;
	        }

	        // Start out running the setup.
	        return RunNextSetup();
	    }
	}

	// To make the benchmark results predictable, we replace Math.random
	// with a 100% deterministic alternative.
	var seed:int = 49734321;
	class Math2 {
	    public static function random():Number {
			// Robert Jenkins' 32 bit integer hash function.
	        seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
	        seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
	        seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
	        seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
	        seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
	        seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
	        return (seed & 0xfffffff) / 0x10000000;
	    }
	}


	// Functions provided to work in tamarin testing framework
	function PrintResult(name, result) {
	    print('name '+name);
	    print('metric v8 ' + result);
	}

	function PrintScore(score) {
	    print('----');
	    print('Score: ' + score);
	}
	function PrintError(name, err) {
	    print("[" +name+ "]: " + err);
	}

	// Provide an alert() function
	function alert(msg){
	    print(msg);
	}
	//Provide load() as a no-op, handled for ASC via dir.asc_args
	function load(src){}
	
// The code has been adapted for use as a benchmark by Google.
var Crypto = new BenchmarkSuite('Crypto', 203037, [
    new Benchmark("Encrypt", encrypt, null, null),
    new Benchmark("Decrypt", decrypt, null, null)
]);

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.
public interface iam {
    function am(i:int,x:int,w:BigInteger,j:int,c:int,n:int,_this:BigInteger):int;
}

public class am1 implements iam {
    // am1: use a single mult and divide to get the high bits,
    // max digit bits should be 26 because
    // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
    public function am(i:int,x:int,w:BigInteger,j:int,c:int,n:int,_this:BigInteger):int {
        var this_array:Vector.<int> = _this.array;
        var w_array:Vector.<int> = w.array;
        while(--n >= 0) {
            var v:int = x*this_array[i++]+w_array[j]+c;
            c = Math.floor(v/0x4000000);
            w_array[j++] = v&0x3ffffff;
        }
        return c;
    }
}

public class am2 implements iam {
    // am2 avoids a big mult-and-extract completely.
    // Max digit bits should be <= 30 because we do bitwise ops
    // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
    public function am(i:int,x:int,w:BigInteger,j:int,c:int,n:int,_this:BigInteger):int {
        var this_array:Vector.<int> = _this.array;
        var w_array:Vector.<int>    = w.array;
        var xl:int = x&0x7fff, xh = x>>15;
        while(--n >= 0) {
            var l:int = this_array[i]&0x7fff;
            var h:int = this_array[i++]>>15;
            var m:int = xh*l+h*xl;
            l = xl*l+((m&0x7fff)<<15)+w_array[j]+(c&0x3fffffff);
            c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
            w_array[j++] = l&0x3fffffff;
        }
        return c;
    }
}
    
public class am3 implements iam {
    // Alternately, set max digit bits to 28 since some
    // browsers slow down when dealing with 32-bit numbers.
    public function am(i:int,x:int,w:BigInteger,j:int,c:int,n:int,_this:BigInteger):int {
        var this_array:Vector.<int> = _this.array;
        var w_array:Vector.<int>    = w.array;

        var xl:int = x&0x3fff, xh:int = x>>14;
        while(--n >= 0) {
            var l:int = this_array[i]&0x3fff;
            var h:int = this_array[i++]>>14;
            var m:int = xh*l+h*xl;
            l = xl*l+((m&0x3fff)<<14)+w_array[j] + c;
            c = (l>>28)+(m>>14)+xh*h;
            w_array[j++] = l&0xfffffff;
        }
        return c;
  }
}

public class am4 implements iam {
    // This is tailored to VMs with 2-bit tagging. It makes sure
    // that all the computations stay within the 29 bits available.
    public function am(i:int,x:int,w:BigInteger,j:int,c:int,n:int,_this:BigInteger):int {
      var this_array:Vector.<int> = _this.array;
      var w_array:Vector.<int>    = w.array;
    
      var xl:int = x&0x1fff, xh = x>>13;
      while(--n >= 0) {
        var l:int = this_array[i]&0x1fff;
        var h:int = this_array[i++]>>13;
        var m:int = xh*l+h*xl;
        l = xl*l+((m&0x1fff)<<13)+w_array[j]+c;
        c = (l>>26)+(m>>13)+xh*h;
        w_array[j++] = l&0x3ffffff;
      }
      return c;
    }
    
    // am3/28 is best for SM, Rhino, but am4/26 is best for v8.
    // Kestrel (Opera 9.5) gets its best result with am4/26.
    // IE7 does 9% better with am3/28 than with am4/26.
    // Firefox (SM) gets 10% faster with am3/28 than with am4/26.
}

public class BigInteger {
  
    public static const LOWPRIMES:Vector.<int> = new <int> [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509];
    public static const BI_RM:String = "0123456789abcdefghijklmnopqrstuvwxyz";
    
    public static var ZERO:BigInteger;
    public static var ONE:BigInteger;
    public static var constsInitialized:Boolean = false;
    public static var defaultAm:iam;
    public static var dbits:int;
    public static var BI_DB:int;
    public static var BI_DM:int;
    public static var BI_DV:int;
    public static var BI_FP:int;
    public static var BI_FV:Number;
    public static var BI_F1:int;
    public static var BI_F2:int;
    public static var BI_RC:Vector.<int>;
    
    public var array:Vector.<int>;
    public var t:int;
    public var s:int;
    public var am:iam; // amX function to use
    
    public function BigInteger(a:*=null, b:*=null, c:*=null):void {
        this.array = new Vector.<int>(256);
		if(a != null)
            if(a is Number) fromNumber(a,b,c);
        else if(b == null && !(a is String))
            fromString(a,256);
        else fromString(a,b);
        this.am = defaultAm;
    }
    
    // (public) alternate constructor
    // bnpFromNumber
    public function fromNumber(a:Number, b:Object, c:Object = null):void {
        if(b is Number) {
            // new BigInteger(int,int,RNG)
            if(a < 2) this.fromInt(1);
            else {
                this.fromNumber(a,c);
                if(!this.testBit(a-1))  // force MSB set
                    this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
                if(this.isEven()) this.dAddOffset(1,0); // force odd
                while(!this.isProbablePrime(b)) {
                    this.dAddOffset(2,0);
                    if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
                }
            }
        } else {
            // new BigInteger(int,RNG)
            var x:Vector.<int> = new Vector.<int>((a>>3)+1), t:int = a&7;
            b.nextBytes(x);
            if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
        }
    }
    

    
    public static function setupEngine(selectedAm:iam, bits:int):void {
        defaultAm = selectedAm;
        dbits = bits;

        BI_DB = dbits;
        BI_DM = ((1<<dbits)-1);
        BI_DV = (1<<dbits);

        BI_FP = 52;
        BI_FV = Math.pow(2,BI_FP);
        BI_F1 = BI_FP-dbits;
        BI_F2 = 2*dbits-BI_FP;

        // Digit conversions
        BI_RC = new Vector.<int>(97);
        var rr:int,vv:int;
        rr = "0".charCodeAt(0);
        for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
        rr = "a".charCodeAt(0);
        for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
        rr = "A".charCodeAt(0);
        for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

        // init consts
        BigInteger.ZERO = nbv(0);
        BigInteger.ONE = nbv(1);
    }
      // return bigint initialized to value
    public static function nbv(i:int):BigInteger {
        var r:BigInteger = nbi();
        r.fromInt(i);
        return r;
    }
    
    // return new, unset BigInteger
    public static function nbi():BigInteger {
        return new BigInteger(null);
    }

    public function int2char(n:int):String {
        return BI_RM.charAt(n);
    }
    
    public function intAt(s:String,i:int):int {
        var c:int = BI_RC[s.charCodeAt(i)];
        return (c==null)?-1:c;
    }


    
    // (public) return x s.t. r^x < DV
    // bnpChunkSize
    public function chunkSize(r:int):int {
        return Math.floor(Math.LN2*BI_DB/Math.log(r));
    }
    
    // (public) convert to radix string
    // bnpToRadix
    public function toRadix(b:int=undefined):String {
        if(b == undefined) b = 10;
        if(this.signum() == 0 || b < 2 || b > 36) return "0";
        var cs:int = this.chunkSize(b);
        var a:int = Math.pow(b,cs);
        var d = nbv(a), y = nbi(), z = nbi(), r:String = "";
        this.divRemTo(d,y,z);
        while(y.signum() > 0) {
            r = (a+z.intValue()).toString(b).substr(1) + r;
            y.divRemTo(d,y,z);
        }
        return z.intValue().toString(b) + r;
    }
    
    // (public) convert from radix string
    // bnpFromRadix
    public function fromRadix(s,b:int = undefined):void {
        this.fromInt(0);
        if(b == undefined) b = 10;
        var cs:int = this.chunkSize(b);
        var d:int = Math.pow(b,cs), mi:Boolean = false, j:int = 0, w:int = 0;
        for(var i:int = 0; i < s.length; ++i) {
            var x:int = intAt(s,i);
            if(x < 0) {
                if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
                continue;
            }
            w = b*w+x;
            if(++j >= cs) {
                this.dMultiply(d);
                this.dAddOffset(w,0);
                j = 0;
                w = 0;
            }
        }
        if(j > 0) {
            this.dMultiply(Math.pow(b,j));
            this.dAddOffset(w,0);
        }
        if(mi) BigInteger.ZERO.subTo(this,this);
    }
    
    // (public) r = this op a (bitwise)
    // bnpBitwiseTo
    public function bitwiseTo(a:BigInteger,op:Function,r:BigInteger):void {
        var this_array:Vector.<int> = this.array;
        var a_array:Vector.<int>    = a.array;
        var r_array:Vector.<int>    = r.array;
        var i:int, f, m:int = Math.min(a.t,this.t);
        for(i = 0; i < m; ++i) r_array[i] = op(this_array[i],a_array[i]);
        if(a.t < this.t) {
            f = a.s&BI_DM;
            for(i = m; i < this.t; ++i) r_array[i] = op(this_array[i],f);
            r.t = this.t;
        }
        else {
            f = this.s&BI_DM;
            for(i = m; i < a.t; ++i) r_array[i] = op(f,a_array[i]);
            r.t = a.t;
        }
        r.s = op(this.s,a.s);
        r.clamp();
    }
    
    // (public) this op (1<<n)
    // bnpChangeBit
    public function changeBit(n:int,op:Function):BigInteger {
        var r:BigInteger = BigInteger.ONE.shiftLeft(n);
        this.bitwiseTo(r,op,r);
        return r;
    }
    
    // (public) r = this + a
    // bnpAddTo
    public function addTo(a:BigInteger,r:BigInteger):void {
        var this_array:Vector.<int> = this.array;
        var a_array:Vector.<int> = a.array;
        var r_array:Vector.<int> = r.array;
        var i:int = 0, c:int = 0, m:int = Math.min(a.t,this.t);
        while(i < m) {
            c += this_array[i]+a_array[i];
            r_array[i++] = c&BI_DM;
            c >>= BI_DB;
        }
        if(a.t < this.t) {
            c += a.s;
            while(i < this.t) {
                c += this_array[i];
                r_array[i++] = c&BI_DM;
                c >>= BI_DB;
            }
            c += this.s;
        }
        else {
            c += this.s;
            while(i < a.t) {
                c += a_array[i];
                r_array[i++] = c&BI_DM;
                c >>= BI_DB;
            }
            c += a.s;
        }
        r.s = (c<0)?-1:0;
        if(c > 0) r_array[i++] = c;
        else if(c < -1) r_array[i++] = BI_DV+c;
        r.t = i;
        r.clamp();
    }
    
    // (public) this *= n, this >= 0, 1 < n < DV
    // bnpDMultiply
    public function dMultiply(n:int):void {
        var this_array:Vector.<int> = this.array;
        this_array[this.t] = this.am.am(0,n-1,this,0,0,this.t,this);
        ++this.t;
        this.clamp();
    }
    
    // (public) this += n << w words, this >= 0
    // bnpDAddOffset
    public function dAddOffset(n:int,w:int):void {
        var this_array:Vector.<int> = this.array;
        while(this.t <= w) this_array[this.t++] = 0;
        this_array[w] += n;
        while(this_array[w] >= BI_DV) {
            this_array[w] -= BI_DV;
            if(++w >= this.t) this_array[this.t++] = 0;
            ++this_array[w];
        }
    }
    
    // (public) r = lower n words of "this * a", a.t <= n
    // "this" should be the larger one if appropriate.
    // bnpMultiplyLowerTo
    public function multiplyLowerTo(a:BigInteger,n:int,r:BigInteger):void {
        var r_array:Vector.<int> = r.array;
        var a_array:Vector.<int> = a.array;
        var i:int = Math.min(this.t+a.t,n);
        r.s = 0; // assumes a,this >= 0
        r.t = i;
        while(i > 0) r_array[--i] = 0;
        var j:int;
        for(j = r.t-this.t; i < j; ++i) r_array[i+this.t] = this.am.am(0,a_array[i],r,i,0,this.t,this);
        for(j = Math.min(a.t,n); i < j; ++i) this.am.am(0,a_array[i],r,i,0,n-i,this);
        r.clamp();
    }
    
    // (public) r = "this * a" without lower n words, n > 0
    // "this" should be the larger one if appropriate.
    // bnpMultiplyUpperTo
    public function multiplyUpperTo(a:BigInteger,n:int,r:BigInteger):void {
        var r_array:Vector.<int> = r.array;
        var a_array:Vector.<int> = a.array;
        --n;
        var i:int= r.t = this.t+a.t-n;
        r.s = 0; // assumes a,this >= 0
        while(--i >= 0) r_array[i] = 0;
        for(i = Math.max(n-this.t,0); i < a.t; ++i)
            r_array[this.t+i-n] = this.am.am(n-i,a_array[i],r,0,0,this.t+i-n,this);
        r.clamp();
        r.drShiftTo(1,r);
    }
    
    // (public) this % n, n < 2^26
    // bnpModInt
    public function modInt(n:int):int {
        var this_array:Vector.<int> = this.array;
        if(n <= 0) return 0;
        var d:int = BI_DV%n, r:int = (this.s<0)?n-1:0;
        if(this.t > 0)
            if(d == 0) r = this_array[0]%n;
            else for(var i:int = this.t-1; i >= 0; --i) r = (d*r+this_array[i])%n;
        return r;
    }
    
    // (public) true if probably prime (HAC 4.24, Miller-Rabin)
    // bnpMillerRabin
    public function millerRabin(t:int):Boolean {
        var n1:BigInteger = this.subtract(BigInteger.ONE);
        var k:int = n1.getLowestSetBit();
        if(k <= 0) return false;
        var r:BigInteger = n1.shiftRight(k);
        t = (t+1)>>1;
        if(t > LOWPRIMES.length) t = LOWPRIMES.length;
        var a:BigInteger = nbi();
        for(var i:int = 0; i < t; ++i) {
            a.fromInt(LOWPRIMES[i]);
            var y:BigInteger = a.modPow(r,this);
            if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                var j:int = 1;
                while(j++ < k && y.compareTo(n1) != 0) {
                    y = y.modPowInt(2,this);
                    if(y.compareTo(BigInteger.ONE) == 0) return false;
                }
                if(y.compareTo(n1) != 0) return false;
            }
        }
        return true;
    }
    
    // (public)
    // bnClone
    public function clone():BigInteger {
        var r:BigInteger = nbi();
        this.copyTo(r);
        return r;
    }
    
    
    // (public) return value as integer
    // bnIntValue
    public function intValue():int {
        var this_array:Vector.<int> = this.array;
        if(this.s < 0) {
            if(this.t == 1) return this_array[0]-BI_DV;
            else if(this.t == 0) return -1;
        }
        else if(this.t == 1) return this_array[0];
        else if(this.t == 0) return 0;
        // assumes 16 < DB < 32
        return ((this_array[1]&((1<<(32-BI_DB))-1))<<BI_DB)|this_array[0];
    }
    
    // (public) return value as byte
    // bnByteValue
    // TODO: return type?
    public function byteValue():int {
        var this_array:Vector.<int> = this.array;
        return (this.t==0)?this.s:(this_array[0]<<24)>>24;
    }
    
    // (public) return value as short (assumes DB>=16)
    // bnShortValue
    public function shortValue():int {
        var this_array:Vector.<int> = this.array;
        return (this.t==0)?this.s:(this_array[0]<<16)>>16;
    }
    
    // (public) 0 if this == 0, 1 if this > 0
    // bnSigNum
    public function signum():int {
        var this_array:Vector.<int> = this.array;
        if(this.s < 0) return -1;
        else if(this.t <= 0 || (this.t == 1 && this_array[0] <= 0)) return 0;
        else return 1;
    }
    
    // (public) convert to bigendian byte array
    // bnToByteArray
    public function toByteArray():Vector.<int> {
        var this_array:Vector.<int> = this.array;
        var i:int = this.t, r:Vector.<int> = new Vector.<int>();
        r[0] = this.s;
        var p:int = BI_DB-(i*BI_DB)%8, d:int, k:int = 0;
        if(i-- > 0) {
            if(p < BI_DB && (d = this_array[i]>>p) != (this.s&BI_DM)>>p)
                r[k++] = d|(this.s<<(BI_DB-p));
            while(i >= 0) {
                if(p < 8) {
                    d = (this_array[i]&((1<<p)-1))<<(8-p);
                    d |= this_array[--i]>>(p+=BI_DB-8);
                }
                else {
                    d = (this_array[i]>>(p-=8))&0xff;
                    if(p <= 0) { p += BI_DB; --i; }
                }
                if((d&0x80) != 0) d |= -256;
                if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
                if(k > 0 || d != this.s) r[k++] = d;
            }
        }
        return r;
    }
    
    // bnEquals
    public function equals(a:BigInteger):Boolean {
        return(this.compareTo(a)==0);
    }
    
    // bnMin
    public function min(a:BigInteger):BigInteger {
        return(this.compareTo(a)<0)?this:a;
    }
    
    // bnMax
    public function max(a:BigInteger):BigInteger {
        return(this.compareTo(a)>0)?this:a;
    }
    
    
    
    // (public) this & a
    private function op_and(x:int,y:int):int { return x&y; }
    // bnAnd
    public function and(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.bitwiseTo(a,op_and,r);
        return r;
    }
    
    // (public) this | a
    public function op_or(x:int,y:int):int { return x|y; }
    // bnOr
    public function or(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.bitwiseTo(a,op_or,r);
        return r;
    }
    
    // (public) this ^ a
    public function op_xor(x:int,y:int):int { return x^y; }
    //bnXor
    public function xor(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.bitwiseTo(a,op_xor,r);
        return r;
    }
    
    // (public) this & ~a
    public function op_andnot(x:int,y:int):int { return x&~y; }
    // bnAndNot
    public function andNot(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.bitwiseTo(a,op_andnot,r);
        return r;
    }
    
    // (public) ~this
    // bnNot
    public function not():BigInteger {
        var this_array:Vector.<int> = this.array;
        var r:BigInteger = nbi();
        var r_array:Vector.<int> = r.array;

        for(var i:int = 0; i < this.t; ++i) r_array[i] = BI_DM&~this_array[i];
        r.t = this.t;
        r.s = ~this.s;
        return r;
    }
    
    // (public) this << n
    // bnShiftLeft
    public function shiftLeft(n:int):BigInteger {
        var r:BigInteger = nbi();
        if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
        return r;
    }
    
    // (public) this >> n
    // bnShiftRight
    public function shiftRight(n:int):BigInteger {
        var r:BigInteger = nbi();
        if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
        return r;
    }
    
    // return index of lowest 1-bit in x, x < 2^31
    private function lbit(x:int):int {
        if(x == 0) return -1;
        var r:int = 0;
        if((x&0xffff) == 0) { x >>= 16; r += 16; }
        if((x&0xff) == 0) { x >>= 8; r += 8; }
        if((x&0xf) == 0) { x >>= 4; r += 4; }
        if((x&3) == 0) { x >>= 2; r += 2; }
        if((x&1) == 0) ++r;
        return r;
    }
    
    // (public) returns index of lowest 1-bit (or -1 if none)
    // bnGetLowestSetBit
    public function getLowestSetBit():int {
        var this_array:Vector.<int> = this.array;
        for(var i:int = 0; i < this.t; ++i)
            if(this_array[i] != 0) return i*BI_DB+lbit(this_array[i]);
        if(this.s < 0) return this.t*BI_DB;
        return -1;
    }
    
    // return number of 1 bits in x
    private function cbit(x:int):int {
        var r:int = 0;
        while(x != 0) { x &= x-1; ++r; }
        return r;
    }
    
    // (public) return number of set bits
    // bnBitCount
    public function bitCount():int {
        var r:int = 0, x:int = this.s&BI_DM;
        for(var i:int = 0; i < this.t; ++i) r += cbit(this_array[i]^x);
        return r;
    }
    
    // (public) true iff nth bit is set
    // bnTestBit
    public function testBit(n:int):Boolean {
        var this_array:Vector.<int> = this.array;
        var j:int = Math.floor(n/BI_DB);
        if(j >= this.t) return(this.s!=0);
        return((this_array[j]&(1<<(n%BI_DB)))!=0);
    }
    
    // (public) this | (1<<n)
    // bnSetBit
    public function setBit(n:int):BigInteger { return this.changeBit(n,op_or); }
    
    // (public) this & ~(1<<n)
    // bnClearBit
    public function clearBit(n:int):BigInteger { return this.changeBit(n,op_andnot); }
    
    // (public) this ^ (1<<n)
    // bnFlipBit
    public function flipBit(n:int):BigInteger { return this.changeBit(n,op_xor); }
    
    // (public) this + a
    // bnAdd
    public function add(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.addTo(a,r);
        return r;
    }
    
    // (public) this - a
    // bnSubtract
    public function subtract(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.subTo(a,r);
        return r;
    }
    
    // (public) this * a
    // bnMultiply
    public function multiply(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.multiplyTo(a,r);
        return r;
    }
    
    // (public) this / a
    // bnDivide
    public function divide(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.divRemTo(a,r,null);
        return r;
    }
    
    // (public) this % a
    // bnRemainder
    public function remainder(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.divRemTo(a,null,r);
        return r;
    }
    
    // (public) [this/a,this%a]
    // bnDivideAndRemainder
    public function divideAndRemainder(a:BigInteger):Array {
        var q:BigInteger = nbi(), r:BigInteger = nbi();
        this.divRemTo(a,q,r);
        return new Array(q,r);
    }
  
    // (public) copy this to r
    // bnpCopyTo
    public function copyTo(r:BigInteger):void {
        var this_array:Vector.<int> = this.array;
        var r_array:Vector.<int>    = r.array;

        for(var i:int = this.t-1; i >= 0; --i) r_array[i] = this_array[i];
        r.t = this.t;
        r.s = this.s;
    }
    
    // (public) set from integer value x, -DV <= x < DV
    // bnpFromInt
    public function fromInt(x:int):void {
		var this_array:Vector.<int> = this.array;
		this.t = 1;
        this.s = (x<0)?-1:0;
        if(x > 0) 
			this_array[0] = x;
        else if(x < -1)
			this_array[0] = x+DV;
        else 
			this.t = 0;
    }
    
    // (public) set from string and radix
    // bnpFromString
    public function fromString(s:*,b:int):void {
        var this_array:Vector.<int> = this.array;
        var k:int;
        if(b == 16) k = 4;
        else if(b == 8) k = 3;
        else if(b == 256) k = 8; // byte array
        else if(b == 2) k = 1;
        else if(b == 32) k = 5;
        else if(b == 4) k = 2;
        else { this.fromRadix(s,b); return; }
        this.t = 0;
        this.s = 0;
        var i:int = s.length, mi:Boolean = false, sh:int = 0;
        while(--i >= 0) {
            var x:int = (k==8)?s[i]&0xff:intAt(s,i);
            if(x < 0) {
                if(s.charAt(i) == "-") mi = true;
                continue;
            }
            mi = false;
            if(sh == 0)
                this_array[this.t++] = x;
            else if(sh+k > BI_DB) {
                this_array[this.t-1] |= (x&((1<<(BI_DB-sh))-1))<<sh;
                this_array[this.t++] = (x>>(BI_DB-sh));
            }
            else
                this_array[this.t-1] |= x<<sh;
            sh += k;
            if(sh >= BI_DB) sh -= BI_DB;
        }
        if(k == 8 && (s[0]&0x80) != 0) {
            this.s = -1;
            if(sh > 0) this_array[this.t-1] |= ((1<<(BI_DB-sh))-1)<<sh;
        }
      
        this.clamp();
        if(mi) BigInteger.ZERO.subTo(this,this);
    }
    
    // (public) clamp off excess high words
    // bnpClamp
    public function clamp():void {
        var this_array:Vector.<int> = this.array;
        var c:int = this.s&BI_DM;
        while(this.t > 0 && this_array[this.t-1] == c) --this.t;
    }
    
    // (public) return string representation in given radix
    // bnToString
    public function toString(b:int=16):String {
        var this_array:Vector.<int> = this.array;
        if(this.s < 0) return "-"+this.negate().toString(b);
        var k:int;
        if(b == 16) k = 4;
        else if(b == 8) k = 3;
        else if(b == 2) k = 1;
        else if(b == 32) k = 5;
        else if(b == 4) k = 2;
        else return this.toRadix(b);
        var km:int = (1<<k)-1, d:int, m:Boolean = false, r:String = "", i:int = this.t;
        var p = BI_DB-(i*BI_DB)%k;
        if(i-- > 0) {
            if(p < BI_DB && (d = this_array[i]>>p) > 0) { m = true; r = int2char(d); }
            while(i >= 0) {
                if(p < k) {
                    d = (this_array[i]&((1<<p)-1))<<(k-p);
                    d |= this_array[--i]>>(p+=BI_DB-k);
                }
                else {
                    d = (this_array[i]>>(p-=k))&km;
                    if(p <= 0) { p += BI_DB; --i; }
                }
                if(d > 0) m = true;
                if(m) r += int2char(d);
            }
        }
        return m?r:"0";
    }
    
    // (public) -this
    // bnNegate
    public function negate():BigInteger {
        var r:BigInteger = nbi();
        BigInteger.ZERO.subTo(this,r);
        return r;
    }
    
    // (public) |this|
    // bnAbs
    public function abs():BigInteger {
        return (this.s<0)?this.negate():this;
    }
    
    // (public) return + if this > a, - if this < a, 0 if equal
    // bnCompareTo
    public function compareTo(a:BigInteger):int {
        var this_array:Vector.<int> = this.array;
        var a_array:Vector.<int> = a.array;

        var r:int = this.s-a.s;
        if(r != 0) return r;
        var i:int = this.t;
        r = i-a.t;
        if(r != 0) return r;
        while(--i >= 0) if((r=this_array[i]-a_array[i]) != 0) return r;
        return 0;
    }
    
    // returns bit length of the integer x
    private function nbits(x:int):int {
        var r:int = 1, t:int;
        if((t=x>>>16) != 0) { x = t; r += 16; }
        if((t=x>>8) != 0) { x = t; r += 8; }
        if((t=x>>4) != 0) { x = t; r += 4; }
        if((t=x>>2) != 0) { x = t; r += 2; }
        if((t=x>>1) != 0) { x = t; r += 1; }
        return r;
    }
    
    // (public) return the number of bits in "this"
    // bnBitLength
    public function bitLength():int {
        var this_array:Vector.<int> = this.array;
        if(this.t <= 0) return 0;
        return BI_DB*(this.t-1)+nbits(this_array[this.t-1]^(this.s&BI_DM));
    }
    
    // (public) r = this << n*DB
    // bnpDLShiftTo
    public function dlShiftTo(n:int,r:BigInteger):void {
        var this_array:Vector.<int> = this.array;
        var r_array:Vector.<int> = r.array;
        var i:int;
        for(i = this.t-1; i >= 0; --i) r_array[i+n] = this_array[i];
        for(i = n-1; i >= 0; --i) r_array[i] = 0;
        r.t = this.t+n;
        r.s = this.s;
    }
    
    // (public) r = this >> n*DB
    // bnpDRShiftTo
    public function drShiftTo(n:int,r:BigInteger):void {
        var this_array:Vector.<int> = this.array;
        var r_array:Vector.<int> = r.array;
        for(var i:int = n; i < this.t; ++i) r_array[i-n] = this_array[i];
        r.t = Math.max(this.t-n,0);
        r.s = this.s;
    }
    
    // (public) r = this << n
    // bnpLShiftTo
    public function lShiftTo(n:int,r:BigInteger):void {
        var this_array:Vector.<int> = this.array;
        var r_array:Vector.<int> = r.array;
        var bs:int = n%BI_DB;
        var cbs:int = BI_DB-bs;
        var bm:int = (1<<cbs)-1;
        var ds:int = Math.floor(n/BI_DB), c:int = (this.s<<bs)&BI_DM, i:int;
        for(i = this.t-1; i >= 0; --i) {
            r_array[i+ds+1] = (this_array[i]>>cbs)|c;
            c = (this_array[i]&bm)<<bs;
        }
        for(i = ds-1; i >= 0; --i) r_array[i] = 0;
        r_array[ds] = c;
        r.t = this.t+ds+1;
        r.s = this.s;
        r.clamp();
    }
    
    // (public) r = this >> n
    // bnpRShiftTo
    public function rShiftTo(n:int,r:BigInteger):void {
        var this_array:Vector.<int> = this.array;
        var r_array:Vector.<int> = r.array;
        r.s = this.s;
        var ds:int = Math.floor(n/BI_DB);
        if(ds >= this.t) { r.t = 0; return; }
        var bs:int = n%BI_DB;
        var cbs:int = BI_DB-bs;
        var bm:int = (1<<bs)-1;
        r_array[0] = this_array[ds]>>bs;
        for(var i:int = ds+1; i < this.t; ++i) {
            r_array[i-ds-1] |= (this_array[i]&bm)<<cbs;
            r_array[i-ds] = this_array[i]>>bs;
        }
        if(bs > 0) r_array[this.t-ds-1] |= (this.s&bm)<<cbs;
        r.t = this.t-ds;
        r.clamp();
    }
    
    // (public) r = this - a
    // bnpSubTo
    public function subTo(a:BigInteger,r:BigInteger):void {
        var this_array:Vector.<int> = this.array;
        var r_array:Vector.<int> = r.array;
        var a_array:Vector.<int> = a.array;
        var i:int = 0, c:int = 0, m:int = Math.min(a.t,this.t);
        while(i < m) {
            c += this_array[i]-a_array[i];
            r_array[i++] = c&BI_DM;
            c >>= BI_DB;
        }
        if(a.t < this.t) {
            c -= a.s;
            while(i < this.t) {
                c += this_array[i];
                r_array[i++] = c&BI_DM;
                c >>= BI_DB;
            }
            c += this.s;
        }
        else {
            c += this.s;
            while(i < a.t) {
                c -= a_array[i];
                r_array[i++] = c&BI_DM;
                c >>= BI_DB;
            }
            c -= a.s;
        }
        r.s = (c<0)?-1:0;
        if(c < -1) r_array[i++] = BI_DV+c;
        else if(c > 0) r_array[i++] = c;
        r.t = i;
        r.clamp();
    }
    
    // (public) r = this * a, r != this,a (HAC 14.12)
    // "this" should be the larger one if appropriate.
    // bnpMultiplyTo
    public function multiplyTo(a:BigInteger,r:BigInteger):void {
        var this_array:Vector.<int> = this.array;
        var r_array:Vector.<int> = r.array;
        var x:BigInteger = this.abs(), y:BigInteger = a.abs();
        var y_array:Vector.<int> = y.array;

        var i:int = x.t;
        r.t = i+y.t;
        while(--i >= 0) r_array[i] = 0;
        for(i = 0; i < y.t; ++i) r_array[i+x.t] = x.am.am(0,y_array[i],r,i,0,x.t,x);
        r.s = 0;
        r.clamp();
        if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
    }
    
    // (public) r = this^2, r != this (HAC 14.16)
    // bnpSquareTo
    public function squareTo(r:BigInteger):void {
        var x:BigInteger = this.abs();
        var x_array:Vector.<int> = x.array;
        var r_array:Vector.<int> = r.array;

        var i:int = r.t = 2*x.t;
        while(--i >= 0) r_array[i] = 0;
        for(i = 0; i < x.t-1; ++i) {
            var c:int = x.am.am(i,x_array[i],r,2*i,0,1,x);
            if((r_array[i+x.t]+=x.am.am(i+1,2*x_array[i],r,2*i+1,c,x.t-i-1,x)) >= BI_DV) {
                r_array[i+x.t] -= BI_DV;
                r_array[i+x.t+1] = 1;
            }
        }
        if(r.t > 0) r_array[r.t-1] += x.am.am(i,x_array[i],r,2*i,0,1,x);
        r.s = 0;
        r.clamp();
    }
    
    // (public) divide this by m, quotient and remainder to q, r (HAC 14.20)
    // r != q, this != m.  q or r may be null.
    // bnpDivRemTo
    public function divRemTo(m:BigInteger,q:BigInteger,r:BigInteger):void {
        var pm:BigInteger = m.abs();
        if(pm.t <= 0) return;
        var pt:BigInteger = this.abs();
        if(pt.t < pm.t) {
            if(q != null) q.fromInt(0);
            if(r != null) this.copyTo(r);
            return;
        }
        if(r == null) r = nbi();
        var y:BigInteger= nbi(), ts:int = this.s, ms:int = m.s;
        var pm_array:Vector.<int> = pm.array;
        var nsh:int = BI_DB-nbits(pm_array[pm.t-1]);    // normalize modulus
        if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
        else { pm.copyTo(y); pt.copyTo(r); }
        var ys:int = y.t;

        var y_array:Vector.<int> = y.array;
        var y0:int = y_array[ys-1];
        if(y0 == 0) return;
        var yt:Number = y0*(1<<BI_F1)+((ys>1)?y_array[ys-2]>>BI_F2:0);
        var d1:Number = BI_FV/yt, d2:Number = (1<<BI_F1)/yt, e:int = 1<<BI_F2;
        var i:int = r.t, j:int = i-ys, t:BigInteger = (q==null)?nbi():q;
        y.dlShiftTo(j,t);

        var r_array:Vector.<int> = r.array;
        if(r.compareTo(t) >= 0) {
            r_array[r.t++] = 1;
            r.subTo(t,r);
        }
        BigInteger.ONE.dlShiftTo(ys,t);
        t.subTo(y,y);   // "negative" y so we can replace sub with am later
        while(y.t < ys) y_array[y.t++] = 0;
        while(--j >= 0) {
            // Estimate quotient digit
            var qd:int = (r_array[--i]==y0)?BI_DM:Math.floor(r_array[i]*d1+(r_array[i-1]+e)*d2);
            if((r_array[i]+=y.am.am(0,qd,r,j,0,ys,y)) < qd) {   // Try it out
                y.dlShiftTo(j,t);
                r.subTo(t,r);
                while(r_array[i] < --qd) r.subTo(t,r);
            }
        }
        if(q != null) {
            r.drShiftTo(ys,q);
            if(ts != ms) BigInteger.ZERO.subTo(q,q);
        }
        r.t = ys;
        r.clamp();
        if(nsh > 0) r.rShiftTo(nsh,r);  // Denormalize remainder
        if(ts < 0) BigInteger.ZERO.subTo(r,r);
    }
    
    // (public) this mod a
    // bnMod
    public function mod(a:BigInteger):BigInteger {
        var r:BigInteger = nbi();
        this.abs().divRemTo(a,null,r);
        if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
        return r;
    }
    
    // (public) return "-1/this % 2^DB"; useful for Mont. reduction
    // justification:
    //         xy == 1 (mod m)
    //         xy =  1+km
    //   xy(2-xy) = (1+km)(1-km)
    // x[y(2-xy)] = 1-k^2m^2
    // x[y(2-xy)] == 1 (mod m^2)
    // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
    // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
    // JS multiply "overflows" differently from C/C++, so care is needed here.
    // bnpInvDigit
    public function invDigit():int {
        var this_array:Vector.<int> = this.array;
        if(this.t < 1) return 0;
        var x:int = this_array[0];
        if((x&1) == 0) return 0;
        var y:int = x&3;                // y == 1/x mod 2^2
        y = (y*(2-(x&0xf)*y))&0xf;      // y == 1/x mod 2^4
        y = (y*(2-(x&0xff)*y))&0xff;    // y == 1/x mod 2^8
        y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;     // y == 1/x mod 2^16
        // last step - calculate inverse mod DV directly;
        // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
        y = (y*(2-x*y%BI_DV))%BI_DV;            // y == 1/x mod 2^dbits
        // we really want the negative inverse, and -DV < y < DV
        return (y>0)?BI_DV-y:-y;
    }
    
    // (public) true iff this is even
    // bnpIsEven
    public function isEven():Boolean {
        var this_array:Vector.<int> = this.array;
        return ((this.t>0)?(this_array[0]&1):this.s) == 0;
    }
    
    // (public) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    // bnpExp
    public function exp(e:int,z:ModularReduction):BigInteger {
        if(e > 0xffffffff || e < 1) return BigInteger.ONE;
        var r:BigInteger = nbi(), r2:BigInteger  = nbi(), g:BigInteger  = z.convert(this), i:int = nbits(e)-1;
        g.copyTo(r);
        while(--i >= 0) {
            z.sqrTo(r,r2);
            if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
            else { var t:BigInteger = r; r = r2; r2 = t; }
        }
        return z.revert(r);
    }
    
    // (public) this^e % m, 0 <= e < 2^32
    // bnModPowInt
    public function modPowInt(e:int,m:BigInteger):BigInteger {
        var z:ModularReduction;
		print ("POW 0")
        if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
        return this.exp(e,z);
    }
  
    // (public) this^e
    // bnPow
    public function pow(e:int):BigInteger {
        return this.exp(e,new NullExp());
    }
    
    // (public) this^e % m (HAC 14.85)
    // bnModPow
    public function modPow(e:BigInteger,m:BigInteger):BigInteger {
        var e_array:Vector.<int> = e.array;
        var i:int = e.bitLength(), k:int, r:BigInteger = nbv(1), z:ModularReduction;
        if(i <= 0) return r;
        else if(i < 18) k = 1;
        else if(i < 48) k = 3;
        else if(i < 144) k = 4;
        else if(i < 768) k = 5;
        else k = 6;
        if(i < 8)
            z = new Classic(m);
        else if(m.isEven())
            z = new Barrett(m);
        else
            z = new Montgomery(m);
    
        // precomputation
        var g:Vector.<BigInteger> = new Vector.<BigInteger>((1<<k)-1), n:int = 3, k1:int = k-1, km:int = (1<<k)-1;
        g[1] = z.convert(this);
        if(k > 1) {
            var g2:BigInteger = nbi();
            z.sqrTo(g[1],g2);
            while(n <= km) {
                g[n] = nbi();
                z.mulTo(g2,g[n-2],g[n]);
                n += 2;
            }
        }
    
        var j:int = e.t-1, w:int, is1:Boolean = true, r2:BigInteger = nbi(), t:BigInteger;
        i = nbits(e_array[j])-1;
        while(j >= 0) {
            if(i >= k1) w = (e_array[j]>>(i-k1))&km;
            else {
                w = (e_array[j]&((1<<(i+1))-1))<<(k1-i);
                if(j > 0) w |= e_array[j-1]>>(BI_DB+i-k1);
            }
    
            n = k;
            while((w&1) == 0) { w >>= 1; --n; }
            if((i -= n) < 0) { i += BI_DB; --j; }
            if(is1) {   // ret == 1, don't bother squaring or multiplying it
                g[w].copyTo(r);
                is1 = false;
            }
            else {
                while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
                if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
                z.mulTo(r2,g[w],r);
            }
    
            while(j >= 0 && (e_array[j]&(1<<i)) == 0) {
                z.sqrTo(r,r2); t = r; r = r2; r2 = t;
                if(--i < 0) { i = BI_DB-1; --j; }
            }
        }
        return z.revert(r);
    }
    
    // (public) gcd(this,a) (HAC 14.54)
    // bnGCD
    public function gcd(a:BigInteger):BigInteger {
        var x:BigInteger = (this.s<0)?this.negate():this.clone();
        var y:BigInteger = (a.s<0)?a.negate():a.clone();
        if(x.compareTo(y) < 0) { var t:BigInteger = x; x = y; y = t; }
        var i:int = x.getLowestSetBit(), g:int = y.getLowestSetBit();
        if(g < 0) return x;
        if(i < g) g = i;
        if(g > 0) {
            x.rShiftTo(g,x);
            y.rShiftTo(g,y);
        }
        while(x.signum() > 0) {
            if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
            if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
            if(x.compareTo(y) >= 0) {
                x.subTo(y,x);
                x.rShiftTo(1,x);
            }
            else {
                y.subTo(x,y);
                y.rShiftTo(1,y);
            }
        }
        if(g > 0) y.lShiftTo(g,y);
        return y;
    }
    
    
    
    // (public) 1/this % m (HAC 14.61)
    // bnModInverse
    public function modInverse(m:BigInteger):BigInteger {
        var ac:Boolean = m.isEven();
        if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
        var u:BigInteger = m.clone(), v:BigInteger = this.clone();
        var a:BigInteger = nbv(1), b:BigInteger = nbv(0), c:BigInteger = nbv(0), d:BigInteger = nbv(1);
        while(u.signum() != 0) {
            while(u.isEven()) {
                u.rShiftTo(1,u);
                if(ac) {
                    if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
                    a.rShiftTo(1,a);
                }
                else if(!b.isEven()) b.subTo(m,b);
                b.rShiftTo(1,b);
            }
            while(v.isEven()) {
                v.rShiftTo(1,v);
                if(ac) {
                    if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
                    c.rShiftTo(1,c);
                }
                else if(!d.isEven()) d.subTo(m,d);
                d.rShiftTo(1,d);
            }
            if(u.compareTo(v) >= 0) {
                u.subTo(v,u);
                if(ac) a.subTo(c,a);
                b.subTo(d,b);
            }
            else {
                v.subTo(u,v);
                if(ac) c.subTo(a,c);
                d.subTo(b,d);
            }
        }
        if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
        if(d.compareTo(m) >= 0) return d.subtract(m);
        if(d.signum() < 0) d.addTo(m,d); else return d;
        if(d.signum() < 0) return d.add(m); else return d;
    }
    
    // (public) test primality with certainty >= 1-.5^t
    // bnIsProbablePrime
    public function isProbablePrime(t:int):Boolean {
        var lplim:int = (1<<26)/LOWPRIMES[LOWPRIMES.length-1];
        var i:BigInteger, x:BigInteger = this.abs();
        var x_array:Vector.<int> = x.array;
        if(x.t == 1 && x_array[0] <= LOWPRIMES[LOWPRIMES.length-1]) {
            for(i = 0; i < LOWPRIMES.length; ++i)
                if(x_array[0] == LOWPRIMES[i]) return true;
            return false;
        }
        if(x.isEven()) return false;
        i = 1;
        while(i < LOWPRIMES.length) {
            var m:int = LOWPRIMES[i], j = i+1;
            while(j < LOWPRIMES.length && m < lplim) m *= LOWPRIMES[j++];
            m = x.modInt(m);
            while(i < j) if(m%LOWPRIMES[i++] == 0) return false;
        }
        return x.millerRabin(t);
    }
    
} // class BigInteger

public interface ModularReduction {
    function convert(x:BigInteger) : BigInteger;
    function revert(x:BigInteger) : BigInteger;
    function reduce(x:BigInteger) : void;
    function mulTo(x:BigInteger,y:BigInteger,r:BigInteger) : void;
    function sqrTo(x:BigInteger,r:BigInteger) : void;
} // interface ModularReduction

public class NullExp implements ModularReduction {
    // A "null" reducer
    public function NullExp():void {}
    // nNop
    public function convert(x:BigInteger):BigInteger {
        return x;
    }
    public function revert(x:BigInteger):BigInteger {
        return x;
    }
    
    public function reduce(x:BigInteger):void {}
    // nMulTo
    public function mulTo(x:BigInteger,y:BigInteger,r:BigInteger):void {
        x.multiplyTo(y,r);
    }
    // nSqrTo
    public function sqrTo(x:BigInteger,r:BigInteger):void {
        x.squareTo(r);
    }
} // class NullExp

public class Classic implements ModularReduction {
    private var m:BigInteger;
    public function Classic(m:BigInteger):void {
        this.m = m;
    }
    // cConvert
    public function convert(x:BigInteger):BigInteger {
        if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
        else return x;
    }
    // cRevert
    public function revert(x:BigInteger):BigInteger { return x; }
    // cReduce
    public function reduce(x:BigInteger):void { x.divRemTo(this.m,null,x); }
    // cMulTo
    public function mulTo(x:BigInteger,y:BigInteger,r:BigInteger):void {
        x.multiplyTo(y,r);
        this.reduce(r);
    }
    // cSqrTo
    public function sqrTo(x:BigInteger,r:BigInteger):void {
        x.squareTo(r);
        this.reduce(r);
    }
} // class Classic
  
public class Montgomery implements ModularReduction {
    private var m : BigInteger;
    private var mt2 : int;
    private var mp : int;
    private var mpl : int;
    private var mph : int;
    private var um : int;
    public function Montgomery(m:BigInteger):void {
          this.m = m;
          this.mp = m.invDigit();
          this.mpl = this.mp&0x7fff;
          this.mph = this.mp>>15;
          this.um = (1<<(BigInteger.BI_DB-15))-1;
          this.mt2 = 2*m.t;
    }
    // xR mod m
    public function convert (x:BigInteger):BigInteger {
          var r:BigInteger = BigInteger.nbi();
          x.abs().dlShiftTo(this.m.t,r);
          r.divRemTo(this.m,null,r);
          if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
          return r;
    }
    
    // x/R mod m
    public function revert(x:BigInteger):BigInteger {
          var r:BigInteger = BigInteger.nbi();
          x.copyTo(r);
          this.reduce(r);
          return r;
    }
    
    // x = x/R mod m (HAC 14.32)
    public function reduce(x:BigInteger):void {
        var x_array:Vector.<int> = x.array;
        while(x.t <= this.mt2)  // pad x so am has enough room later
            x_array[x.t++] = 0;
        for(var i:int = 0; i < this.m.t; ++i) {
            // faster way of calculating u0 = x[i]*mp mod DV
            var j:int = x_array[i]&0x7fff;
            var u0:int = (j*this.mpl+(((j*this.mph+(x_array[i]>>15)*this.mpl)&this.um)<<15))&BigInteger.BI_DM;
            // use am to combine the multiply-shift-add into one call
            j = i+this.m.t;
            x_array[j] += this.m.am.am(0,u0,x,i,0,this.m.t,this.m);
            // propagate carry
            while(x_array[j] >= BigInteger.BI_DV) { x_array[j] -= BigInteger.BI_DV; x_array[++j]++; }
          }
          x.clamp();
          x.drShiftTo(this.m.t,x);
          if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }
    
    // r = "x^2/R mod m"; x != r
    public function sqrTo(x:BigInteger,r:BigInteger):void { x.squareTo(r); this.reduce(r); }
    
    // r = "xy/R mod m"; x,y != r
    public function mulTo(x:BigInteger,y:BigInteger,r:BigInteger):void {
          x.multiplyTo(y,r);
          this.reduce(r);
    }

} // class Montgomery
  
// Barrett modular reduction
public class Barrett implements ModularReduction {
    var m : BigInteger;
    var mu : BigInteger;
    var r2 : BigInteger;
    var q3 : BigInteger;
    
    public function Barrett(m:BigInteger) {
        // setup Barrett
        this.r2 = BigInteger.nbi();
        this.q3 = BigInteger.nbi();
        BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
        this.mu = this.r2.divide(m);
        this.m = m;
    }
    
    public function convert(x:BigInteger):BigInteger {
        if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
        else if(x.compareTo(this.m) < 0) return x;
        else { var r = BigInteger.nbi(); x.copyTo(r); this.reduce(r); return r; }
    }
    
    public function revert(x:BigInteger):BigInteger { return x; }
    
    // x = x mod m (HAC 14.42)
    public function reduce(x:BigInteger):void {
        x.drShiftTo(this.m.t-1,this.r2);
        if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
        this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
        this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
        while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
        x.subTo(this.r2,x);
        while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }
    
    // r = x^2 mod m; x != r
    public function sqrTo(x:BigInteger,r:BigInteger):void { x.squareTo(r); this.reduce(r); }
    
    // r = x*y mod m; x,y != r
    public function mulTo(x:BigInteger,y:BigInteger,r:BigInteger):void {
        x.multiplyTo(y,r);
        this.reduce(r);
    }

} // class Barrett
  
public class ArcFour {
    var i : int;
    var j : int;
    var S : Vector.<int>;
    
    public function ArcFour():void {
        i = 0;
        j = 0;
        S = new Vector.<int>();
    }
    
    /**
    Initialize arcfour context from key, an array of ints,
    each from [0..255]. An array of bytes the size of the
    pool must be passed to init()
    **/
    public function init(key : Vector.<int>) : void {
        var i:int, j:int, t:int;
        for(i = 0; i < 256; ++i)
            this.S[i] = i;
        j = 0;
        for(i = 0; i < 256; ++i) {
            j = (j + this.S[i] + key[i % key.length]) & 255;
            t = this.S[i];
            this.S[i] = this.S[j];
            this.S[j] = t;
        }
        this.i = 0;
        this.j = 0;
    }
    
    /**
    Returns the next byte.
    **/
    public function next() : int {
        var t:int;
        this.i = (this.i + 1) & 255;
        this.j = (this.j + this.S[this.i]) & 255;
        t = this.S[this.i];
        this.S[this.i] = this.S[this.j];
        this.S[this.j] = t;
        return this.S[(t + this.S[this.i]) & 255];
    }
    
    
    public function toString() : String {
        return "ArcFour";
    }
}





public class SecureRandom {
    private static var rng_state:ArcFour;
    private static var rng_pool:Vector.<int>;
    private static var rng_pptr:int;
    // Pool size must be a multiple of 4 and greater than 32.
    // An array of bytes the size of the pool will be passed to init()
    private static var rng_psize:int = 256;
    private static var initialized:Boolean=false;

    public function SecureRandom():void {
        // Initialize the pool with junk if needed.
        if (!initialized) {
            if(rng_pool == null) {
                rng_pool = new Vector.<int>();
                rng_pptr = 0;
                var t:int;
                while(rng_pptr < rng_psize) {  // extract some randomness from Math.random()
                    t = Math.floor(65536 * Math2.random());
                    rng_pool[rng_pptr++] = t >>> 8;
                    rng_pool[rng_pptr++] = t & 255;
                }
                rng_pptr = 0;
                rng_seed_time();
                //rng_seed_int(window.screenX);
                //rng_seed_int(window.screenY);
                initialized = true;
            }
        }
    }
  
    // rng_get_bytes
    public function nextBytes(ba:Vector.<int>):void {
        var i;
        for(i = 0; i < ba.length; ++i)
            ba[i] = rng_get_byte();
    }
    // Plug in your RNG constructor here
    private function prng_newstate():ArcFour {
        return new ArcFour();
    }

    // Mix in a 32-bit integer into the pool
    private function rng_seed_int(x:int):void {
        rng_pool[rng_pptr++] ^= x & 255;
        rng_pool[rng_pptr++] ^= (x >> 8) & 255;
        rng_pool[rng_pptr++] ^= (x >> 16) & 255;
        rng_pool[rng_pptr++] ^= (x >> 24) & 255;
        if(rng_pptr >= rng_psize) rng_pptr -= rng_psize;
    }
  
    // Mix in the current time (w/milliseconds) into the pool
    private function rng_seed_time():void {
        // rng_seed_int(new Date().getTime());
        rng_seed_int(123456);
    }
  
    private function rng_get_byte():int {
        if(rng_state == null) {
            rng_seed_time();
            rng_state = prng_newstate();
            rng_state.init(rng_pool);
            for(rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
                rng_pool[rng_pptr] = 0;
            rng_pptr = 0;
            //rng_pool = null;
        }
        // TODO: allow reseeding after first request
        return rng_state.next();
    }
  
} // class SecureRandom



public class RSAKey {
    var n:BigInteger ;
    var e:int ;
    var d:BigInteger ;
    var p:BigInteger ;
    var q:BigInteger ;
    var dmp1:BigInteger ;
    var dmq1:BigInteger ;
    var coeff:BigInteger ;
  
    // "empty" RSA key constructor
    public function RSAKey():void {
        this.n = null;
        this.e = 0;
        this.d = null;
        this.p = null;
        this.q = null;
        this.dmp1 = null;
        this.dmq1 = null;
        this.coeff = null;
    }
  
    // Set the public key fields N and e from hex strings
    // RSASetPublic
    public function setPublic(N:String,E:String):void {
        if(N != null && E != null && N.length > 0 && E.length > 0) {
            this.n = parseBigInt(N,16);
            this.e = parseInt(E,16);
        }
        else
            print("Invalid RSA public key");
    }
  
    // PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
    function pkcs1pad2(s:String,n:int):BigInteger {
        if(n < s.length + 11) {
            print("Message too long for RSA");
            return null;
        }
        var ba:Vector.<int> = new Vector.<int>(n);
        var i:int = s.length - 1;
        while(i >= 0 && n > 0) ba[--n] = s.charCodeAt(i--);
        ba[--n] = 0;
        var rng:SecureRandom = new SecureRandom();
        var x:Vector.<int> = new Vector.<int>();
        while(n > 2) { // random non-zero pad
            x[0] = 0;
            while(x[0] == 0) rng.nextBytes(x);
            ba[--n] = x[0];
        }
        ba[--n] = 2;
        ba[--n] = 0;
        return new BigInteger(ba);
    }

  
    // convert a (hex) string to a bignum object
    private function parseBigInt(str:String,r:int):BigInteger {
        return new BigInteger(str,r);
    }
  
    // Perform raw public operation on "x": return x^e (mod n)
    // RSADoPublic
    public function doPublic(x:BigInteger):BigInteger {
		print("PUB 0 - " + x)
        return x.modPowInt(this.e, this.n);
    }
  
    // Return the PKCS#1 RSA encryption of "text" as an even-length hex string
    // RSAEncrypt
    public function encrypt(text:String):String {
		print("ENC 0")
        var m:BigInteger = pkcs1pad2(text,(this.n.bitLength()+7)>>3);
        print("ENC 1 - " + m)
		if(m == null) return null;
		print("ENC 2")
        var c:BigInteger = this.doPublic(m);
		print("ENC 3")
        if(c == null) return null;
		print("ENC 4")
        var h:String = c.toString(16);
		print("ENC 5")
        if((h.length & 1) == 0) return h; else return "0" + h;
    }
  
    // Return the PKCS#1 RSA encryption of "text" as a Base64-encoded string
    //function RSAEncryptB64(text) {
    //  var h = this.encrypt(text);
    //  if(h) return hex2b64(h); else return null;
    //}
    //RSAKey.prototype.encrypt_b64 = RSAEncryptB64;
    // Depends on rsa.js and jsbn2.js

    // Undo PKCS#1 (type 2, random) padding and, if valid, return the plaintext
    private function pkcs1unpad2(d:BigInteger,n:int):String {
        var b:Vector.<int> = d.toByteArray();
        var i:int = 0;
        while(i < b.length && b[i] == 0) ++i;
        if(b.length-i != n-1 || b[i] != 2)
            return null;
        ++i;
        while(b[i] != 0)
            if(++i >= b.length) return null;
        var ret:String = "";
        while(++i < b.length)
            ret += String.fromCharCode(b[i]);
        return ret;
    }
  
    // Set the private key fields N, e, and d from hex strings
    // RSASetPrivate
    public function setPrivate(N:String,E:String,D:String):void {
        if(N != null && E != null && N.length > 0 && E.length > 0) {
            this.n = parseBigInt(N,16);
            this.e = parseInt(E,16);
            this.d = parseBigInt(D,16);
        }
        else
            print("Invalid RSA private key");
    }
  
    // Set the private key fields N, e, d and CRT params from hex strings
    // RSASetPrivateEx
    public function setPrivateEx(N:String,E:String,D:String,P:String,Q:String,DP:String,DQ:String,C:String):void {
        if(N != null && E != null && N.length > 0 && E.length > 0) {
            this.n = parseBigInt(N,16);
            this.e = parseInt(E,16);
            this.d = parseBigInt(D,16);
            this.p = parseBigInt(P,16);
            this.q = parseBigInt(Q,16);
            this.dmp1 = parseBigInt(DP,16);
            this.dmq1 = parseBigInt(DQ,16);
            this.coeff = parseBigInt(C,16);
        }
        else
            print("Invalid RSA private key");
    }
  
    // Generate a new random private key B bits long, using public expt E
    // RSAGenerate
    public function generate(B:int,E:String):void {
        var rng:SecureRandom = new SecureRandom();
        var qs:int = B>>1;
        this.e = parseInt(E,16);
        var ee:BigInteger = new BigInteger(E,16);
        for(;;) {
            for(;;) {
                this.p = new BigInteger(B-qs,1,rng);
                if(this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.p.isProbablePrime(10)) break;
            }
            for(;;) {
                this.q = new BigInteger(qs,1,rng);
                if(this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.q.isProbablePrime(10)) break;
            }
            if(this.p.compareTo(this.q) <= 0) {
                var t:BigInteger = this.p;
                this.p = this.q;
                this.q = t;
            }
            var p1:BigInteger = this.p.subtract(BigInteger.ONE);
            var q1:BigInteger = this.q.subtract(BigInteger.ONE);
            var phi:BigInteger = p1.multiply(q1);
            if(phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
                this.n = this.p.multiply(this.q);
                this.d = ee.modInverse(phi);
                this.dmp1 = this.d.mod(p1);
                this.dmq1 = this.d.mod(q1);
                this.coeff = this.q.modInverse(this.p);
                break;
            }
        }
    }
  
    // Perform raw private operation on "x": return x^d (mod n)
    // RSADoPrivate
    public function doPrivate(x:BigInteger):BigInteger {
        if(this.p == null || this.q == null)
        return x.modPow(this.d, this.n);
  
        // TODO: re-calculate any missing CRT params
        var xp:BigInteger = x.mod(this.p).modPow(this.dmp1, this.p);
        var xq:BigInteger = x.mod(this.q).modPow(this.dmq1, this.q);
  
        while(xp.compareTo(xq) < 0)
            xp = xp.add(this.p);
        return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
    }
  
    // Return the PKCS#1 RSA decryption of "ctext".
    // "ctext" is an even-length hex string and the output is a plain string.
    // RSADecrypt
    public function decrypt(ctext:String):String {
        var c:BigInteger = parseBigInt(ctext, 16);
        var m:BigInteger = this.doPrivate(c);
        if(m == null) return null;
        return pkcs1unpad2(m, (this.n.bitLength()+7)>>3);
    }
  
} // class RSAKey


var nValue:String="a5261939975948bb7a58dffe5ff54e65f0498f9175f5a09288810b8975871e99af3b5dd94057b0fc07535f5f97444504fa35169d461d0d30cf0192e307727c065168c788771c561a9400fb49175e9e6aa4e23fe11af69e9412dd23b0cb6684c4c2429bce139e848ab26d0829073351f4acd36074eafd036a5eb83359d2a698d3";
var eValue:String="10001";
var dValue:String="8e9912f6d3645894e8d38cb58c0db81ff516cf4c7e5a14c7f1eddb1459d2cded4d8d293fc97aee6aefb861859c8b6a3d1dfe710463e1f9ddc72048c09751971c4a580aa51eb523357a3cc48d31cfad1d4a165066ed92d4748fb6571211da5cb14bc11b6e2df7c1a559e6d5ac1cd5c94703a22891464fba23d0d965086277a161";
var pValue:String="d090ce58a92c75233a6486cb0a9209bf3583b64f540c76f5294bb97d285eed33aec220bde14b2417951178ac152ceab6da7090905b478195498b352048f15e7d";
var qValue:String="cab575dc652bb66df15a0359609d51d1db184750c00c6698b90ef3465c99655103edbf0d54c56aec0ce3c4d22592338092a126a0cc49f65a4a30d222b411e58f";
var dmp1Value:String="1a24bca8e273df2f0e47c199bbf678604e7df7215480c77c8db39f49b000ce2cf7500038acfff5433b7d582a01f1826e6f4d42e1c57f5e1fef7b12aabc59fd25";
var dmq1Value:String="3d06982efbbe47339e1f6d36b1216b8a741d410b0c662f54f7118b27b9a4ec9d914337eb39841d8666f3034408cf94f5b62f11c402fc994fe15a05493150d9fd";
var coeffValue:String="3a3e731acd8960b7ff9eb81a7ff93bd1cfa74cbd56987db58b4594fb09c09084db1734c8143f98b602b981aaa9243ca28deb69b5b280ee8dcee0fd2625e53250";

// am3/28 is best for SM, Rhino, but am4/26 is best for v8.
// Kestrel (Opera 9.5) gets its best result with am4/26.
// IE7 does 9% better with am3/28 than with am4/26.
// Firefox (SM) gets 10% faster with am3/28 than with am4/26.
var defam:iam = new am3();
BigInteger.setupEngine(defam, 28);
var TEXT:String = "The quick brown fox jumped over the extremely lazy frog! " +
                  "Now is the time for all good men to come to the party.";
var encrypted:String;

function encrypt():void {
	print("HERE");
    var RSA:RSAKey = new RSAKey();
    print("HERE 2");
	RSA.setPublic(nValue, eValue);
	print("HERE 3");
    RSA.setPrivateEx(nValue, eValue, dValue, pValue, qValue, dmp1Value, dmq1Value, coeffValue);
	print("HERE 4");
    encrypted = RSA.encrypt(TEXT);
	print("HERE 5 " + encrypted);
}

function decrypt():void {
    var RSA:RSAKey = new RSAKey();
    RSA.setPublic(nValue, eValue);
    RSA.setPrivateEx(nValue, eValue, dValue, pValue, qValue, dmp1Value, dmq1Value, coeffValue);
    var decrypted:String = RSA.decrypt(encrypted);
    print("HERE 6 " + decrypted);
	if (decrypted != TEXT) {
        throw new Error("Crypto operation failed");
    }
}


// for (var i = 0; i < 1; i++) {
	encrypt();
	decrypt();
// }

/*
// Run the test
BenchmarkSuite.RunSuites({ NotifyResult: PrintResult,
                           NotifyScore: PrintScore,
                           NotifyError: PrintError });
                           
*/

}// package
