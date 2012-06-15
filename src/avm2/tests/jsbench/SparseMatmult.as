        var size;

        var RANDOM_SEED = 10101010;
        
        var datasizes_M = new Array(3);
        datasizes_M[0] = 50000;
        datasizes_M[1] = 100000;
        datasizes_M[2] = 500000;
    datasizes_M[3] = 3125;

        var datasizes_N = new Array(3);
        datasizes_N[0] = 50000;
        datasizes_N[1] = 100000;
        datasizes_N[2] = 500000;
    datasizes_N[3] = 3125;

        var datasizes_nz = new Array(3);
        datasizes_nz[0] = 250000;
        datasizes_nz[1] = 500000;
        datasizes_nz[2] = 2500000;
    datasizes_nz[3] = 15625;

        var SPARSE_NUM_ITER = 200;

        //Random R = new Random(RANDOM_SEED);
        var R = RANDOM_SEED;
        var x;

        var y;

        var val;

        var col;

        var row;
        
        var ytotal=0.0;
        var lastRandom=RANDOM_SEED;

        var start = new Date();
        JGFrun(3);
        var elapsed = new Date() - start;

    if (JGFvalidate())
        print("PASSED");
    else
        print("validation failed");
    
        function _randomInt()
        {
                lastRandom = (lastRandom * 214013 + 2531011) % 16777216;
                return lastRandom;
        }
        function _randomDouble()
        {
                return _randomInt()/16777216;
        }
        function JGFsetsize(sizel) {
                size = sizel;
        }

        function JGFinitialise() {

                x = RandomVector(datasizes_N[size], R);
                y = new Array(datasizes_M[size]);
                //Alex: need to initialize to 0 by default is NAN, the test function does += so
                //if you don't initialize this doesn't work.
                for(var i=0;i<datasizes_M[size];i++)
                {
                        y[i]=0;
                }
                val = new Array(datasizes_nz[size]);
                col = new Array(datasizes_nz[size]);
                row = new Array(datasizes_nz[size]);

                for (var i = 0; i < datasizes_nz[size]; i++) {

                        // generate random row index (0, M-1)
                        row[i] = Math.abs(_randomInt()) % datasizes_M[size];

                        // generate random column index (0, N-1)
                        col[i] = Math.abs(_randomInt()) % datasizes_N[size];

                        val[i] = _randomDouble();

                }

        }

        function JGFkernel() {

                test(y, val, row, col, x, SPARSE_NUM_ITER);

        }

        function JGFvalidate() {

                var refval = new Array(4);
                refval[0] = 75.16427500310363;//75.02484945753453;
                refval[1] = 149.5502067152101;
                refval[2] =     749.5245870753752;
        refval[3] = 4.58385725523243;
                var dev = Math.abs(ytotal - refval[size]);
                if (dev > 1.0e-12) {
                        print("Validation failed");
                        print("ytotal = " + ytotal + "  " + dev + "  " + size);
                        return false;
                }else
                {
                        print("Validation passed");
                        print("ytotal = " + ytotal + "  " + dev + "  " + size);
                }
                print("Y total: " + ytotal + " Dev: " + dev );
                return true;
        }

        function JGFtidyup() {
                System.gc();
        }

        function JGFrun(sizel) {
                JGFsetsize(sizel);
                JGFinitialise();
                JGFkernel();
                JGFvalidate();
                //JGFtidyup();
        }

        function RandomVector( N, R) {
                var A = new Array(N);

                for (var i = 0; i < N; i++)
                {
                        A[i] = _randomDouble() * 1e-6;
                }
                return A;
        }
        
                function test( y,  val,  row,  col,      x,  NUM_ITERATIONS) {
                print("Entering test");
                var nz = val.length;

                for (var reps = 0; reps < NUM_ITERATIONS; reps++) {
                        for (var i = 0; i < nz; i++) {
                                y[row[i]] += x[col[i]] * val[i];
                                //print("y is: "+y[row[i]]+"-x is: "+x[col[i]]+"-val is: "+val[i]+"-row is: "+row[i]+"-col is: "+col[i]);
                        }
                }

                for (var i = 0; i < nz; i++) {
                        ytotal += y[row[i]];
                }
                print("leaving test: "+ytotal);
        }
