var size=4;
var datasizes = new Array(5);
datasizes[0] = 524288;
datasizes[1] = 2097152;
datasizes[2] = 8388608;
datasizes[3] = 16777216;
datasizes[4] = 32768;
var RANDOM_SEED = 10101010;
var JDKtotal = 0.0;
var JDKtotali = 0.0;
        var lastRandom=RANDOM_SEED;
        function _randomInt()
        {
                lastRandom = (lastRandom * 214013 + 2531011) % 16777216;
                return lastRandom;
        }
        function _randomDouble()
        {
                var randomInt = _randomInt();
                var result = randomInt/16777216.0;
                if( result < 0 ) {
                        print("Got a negative number: " + result + "With random int: " + randomInt );
                }
                return result;
        }

    var start = new Date();
    JGFrun(4);
    var elapsed = new Date() - start;

if (JGFvalidate())
    print("PASSED");
else
    print("validation failed");

function JGFrun(sizei) {
                JGFsetsize(sizei);
                JGFinitialise();
                JGFkernel();
                JGFvalidate();

        }
        
        function JGFsetsize(sizei) {
                size = sizei;
        }
        
        function JGFinitialise() {

        }
        
        function JGFkernel() {

                var x = RandomVector(2 * (datasizes[size]), RANDOM_SEED);
                transform(x);
                inverse(x);

        }
        function JGFvalidate() {
                var refval = new Array(5);          // JAVAs value
                refval[0] = 0.5591972812499846;     // 0.4317407470988178
                refval[1] = 1.726962988395339;
                refval[2] = 6.907851953579193;
                refval[3] = 13.815703907167297;
                refval[4] = 0.034949830078124584;   // 0.026983796693676648
                var refvali = new Array(5);
                refvali[0] = 0.524416343749985;     // 0.5245436889646894
                refvali[1] = 2.0974756152524314;
                refvali[2] = 8.389142211032294;
                refvali[3] = 16.778094422092604;
                refvali[4] = 0.03286470898437495;   // 0.03280397441275576
                var dev = Math.abs(JDKtotal - refval[size]);
                var devi = Math.abs(JDKtotali - refvali[size]);
                
                print("Dev: " + dev + " devi: " + devi );
                print("JDK total: " + JDKtotal + " JDKtotali: " + JDKtotali );
                print("\n");
                
                if (dev > 1.0e-12) {
                        print("Validation failed");
                        print("JDKtotal = " + JDKtotal + "  " + dev + "  "+ size);
                }
                if (devi > 1.0e-12) {
                        print("Validation failed");
                        print("JDKtotalinverse = " + JDKtotali + "  " + devi + "  " + size);
                }else
                {
                        print("Validation sucess");
                        print("JDKtotalinverse = " + JDKtotali + "  " + devi + "  " + size);
                        return true;
                }
                return false;
        }
                /** Compute Inverse Fast Fourier Transform of (complex) data, in place. */
        function inverse(data) {
                transform_internal(data, +1);
                // Normalize
                var nd = data.length;
                var n = nd / 2;
                var norm = 1 /n;
                //print("loop1 in inverse\n");
                for (var i = 0; i < nd; i++) {
                        data[i] *= norm;
                }
        
                for (var i = 0; i < nd; i++) {
                        JDKtotali += data[i];
                }
        }
        function RandomVector(N, R) {
                var A = new Array(N);
                for (var i = 0; i < N; i++)
                {
                        A[i] = _randomDouble()* 1e-6;
                }
                return A;
        }
        /** Compute Fast Fourier Transform of (complex) data, in place. */
        function transform(data) {
                var JDKrange;

                transform_internal(data, -1);

                JDKrange = data.length;
                for (var i = 0; i < JDKrange; i++) {
                        JDKtotal += data[i];
                }
        }
        
        function transform_internal(data, direction) {
                var n = data.length / 2;
                if (n == 1)
                {
                        return; // Identity operation!
                }
                var logn = log2(n);

                /* bit reverse the input data for decimation in time algorithm */
                bitreverse(data);

                /* apply fft recursion */
                for (var  bit = 0, dual = 1; bit < logn; bit++, dual *= 2) {
                        var w_real = 1.0;
                        var w_imag = 0.0;

                        var theta = 2.0 * direction * Math.PI / (2.0 * dual);
                        var s = Math.sin(theta);
                        var t = Math.sin(theta / 2.0);
                        var s2 = 2.0 * t * t;
                        
                        /* a = 0 */
                        for (var b = 0; b < n; b += 2 * dual) {
                                var i = 2 * b;
                                var j = 2 * (b + dual);

                                var wd_real = data[j];
                                var wd_imag = data[j + 1];

                                data[j] = data[i] - wd_real;
                                data[j + 1] = data[i + 1] - wd_imag;
                                data[i] += wd_real;
                                data[i + 1] += wd_imag;
                        }

                        /* a = 1 .. (dual-1) */
                        for (var a = 1; a < dual; a++) {
                                /* trignometric recurrence for w-> exp(i theta) w */
                                {
                                        var tmp_real = w_real - s * w_imag - s2 * w_real;
                                        var tmp_imag = w_imag + s * w_real - s2 * w_imag;
                                        w_real = tmp_real;
                                        w_imag = tmp_imag;
                                }
                                for (var b = 0; b < n; b += 2 * dual) {
                                        var i = 2 * (b + a);
                                        var j = 2 * (b + a + dual);

                                        var z1_real = data[j];
                                        var z1_imag = data[j + 1];

                                        var wd_real = w_real * z1_real - w_imag * z1_imag;
                                        var wd_imag = w_real * z1_imag + w_imag * z1_real;

                                        data[j] = data[i] - wd_real;
                                        data[j + 1] = data[i + 1] - wd_imag;
                                        data[i] += wd_real;
                                        data[i + 1] += wd_imag;
                                }
                        }
                }
                //print("leaving transform internal\n");
        }
        
        function bitreverse(data) {
                /* This is the Goldrader bit-reversal algorithm */
                var n = data.length / 2;
                for (var i = 0, j = 0; i < n - 1; i++) {
                        var ii = 2 * i;
                        var jj = 2 * j;
                        var k = n / 2;
                        if (i < j) {
                                var tmp_real = data[ii];
                                var tmp_imag = data[ii + 1];
                                
                                data[ii] = data[jj];
                                data[ii + 1] = data[jj + 1];
                                data[jj] = tmp_real;
                                data[jj + 1] = tmp_imag;
                        }

                        while (k <= j) {
                                j = j - k;
                                k = k / 2;
                        }
                        j += k;
                }
        }
        
        function log2(n) {
                var log = 0;
                for (var k = 1; k < n; k *= 2, log++)
                        ;
                if (n != (1 << log))
                {
                        print("FFT: Data length is not a power of 2!: " + n);
                        print("log: "+log);
                }
                
                return log;
        }
