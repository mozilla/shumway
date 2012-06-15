var size;

        var datasizes = new Array(4);
        datasizes[0] = 1000;
        datasizes[1] = 1500;
        datasizes[2] = 2000;
    datasizes[3] = 225;

        var JACOBI_NUM_ITER = 100;

        var RANDOM_SEED = 10101010;
        var R=RANDOM_SEED;
        var Gtotal = 0.0;
        var lastRandom=RANDOM_SEED;
        function _randomInt()
        {
                lastRandom = (lastRandom * 214013 + 2531011) % 16777216;
                return lastRandom;
        }
        function _randomDouble()
        {
                return _randomInt()/16777216;
        }

        var start = new Date();
        JGFrun(3);
        var elapsed = new Date() - start;

    if (JGFvalidate())
        print("PASSED");
    else
        print("validation failed");
    
        function JGFsetsize(sizel) {
                size = sizel;
        }

        function JGFinitialise() {

        }

        function JGFkernel() {

                var G = RandomMatrix(datasizes[size], datasizes[size], R);

                SORrun(1.25, G, JACOBI_NUM_ITER);

        }

        function JGFvalidate() {

                var refval = new Array(4);
                refval[0] = 0.49819968382576163; //0.4984199298207158;
                refval[1] = 1.122043587235093;
                refval[2] =     1.9967774998523777;
        refval[3] = 0.024878259186755635
                var dev = Math.abs(Gtotal - refval[size]);
                if (dev > 1.0e-12) {
                        print("Validation failed");
                        print("Gtotal = " + Gtotal + "  " + dev + "  " + size);
                        return false;
                }
                print("Gtotal is: " + Gtotal);
                print("Dev is: " + dev);
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

        function RandomMatrix(M,  N, R) {
                var A = new Array(M); //[][] = new double[M][N];
                for(var i =0;i<N;i++)
                {
                        A[i]=new Array(N);
                }
                for (var i = 0; i < N; i++)
                        for (var j = 0; j < N; j++) {
                                A[i][j] = _randomDouble() * 1e-6;
                        }
                return A;
        }
        
        function SORrun( omega,  G,      num_iterations) {
                var M = G.length;
                var N = G[0].length;

                var omega_over_four = omega * 0.25;
                var one_minus_omega = 1.0 - omega;

                // update interior points
                //
                var Mm1 = M - 1;
                var Nm1 = N - 1;


                for (var p = 0; p < num_iterations; p++) {
                        for (var i = 1; i < Mm1; i++) {
                                var Gi = G[i];
                                var Gim1 = G[i - 1];
                                var Gip1 = G[i + 1];
                                for (var j = 1; j < Nm1; j++)
                                        Gi[j] = omega_over_four
                                                        * (Gim1[j] + Gip1[j] + Gi[j - 1] + Gi[j + 1])
                                                        + one_minus_omega * Gi[j];
                        }
                }

                for (var i = 1; i < Nm1; i++) {
                        for (var j = 1; j < Nm1; j++) {
                                Gtotal += G[i][j];
                        }
                }

        }