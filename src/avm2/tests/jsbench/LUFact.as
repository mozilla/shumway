        var size;

        var datasizes = new Array(4);
        datasizes[0] = 500;
        datasizes[1] = 1000;
        datasizes[2] = 2000;
    datasizes[3] = 175;

        var a;

        var b;

        var x;

        var ops, total, norma, normx;

        var resid, time;

        var kf;

        var n, i, ntimes, info, lda, ldaa, kflops;

        var ipvt;

        var start = new Date();
        JGFrun(0);
        var elapsed = new Date() - start;

        print("metric time ");
        function abs(d) {
                return (d >= 0) ? d : -d;
        }
        function JGFsetsize(lsize) {
                size = lsize;
        }

        function JGFinitialise() {

                n = datasizes[size];
                ldaa = n;
                lda = ldaa + 1;

                //a = new double[ldaa][lda];
                a = new Array(ldaa);
                for(var i=0;i<ldaa;i++)
                {
                        a[i] = new Array(lda);
                }
                b = Array(ldaa);
                x = Array(ldaa);
                ipvt = Array(ldaa);

                var nl = n; // avoid integer overflow
                ops = (2.0 * (nl * nl * nl)) / 3.0 + 2.0 * (nl * nl);

                norma = matgen(a, lda, n, b);

        }

        function JGFkernel() {
                info = dgefa(a, lda, n, ipvt);
                dgesl(a, lda, n, ipvt, b, 0);
        }

        function JGFvalidate() {

                var i;
                var eps, residn;
                var ref = new Array(4);
                ref[0] = 6.0;
                ref[1] = 12.0;
                ref[2] = 20.0;
        ref[3] = 3.0

                for (i = 0; i < n; i++) {
                        x[i] = b[i];
                }
                norma = matgen(a, lda, n, b);
                for (i = 0; i < n; i++) {
                        b[i] = -b[i];
                }

                dmxpy(n, b, n, lda, x, a);
                resid = 0.0;
                normx = 0.0;
                for (i = 0; i < n; i++) {
                        resid = (resid > abs(b[i])) ? resid : abs(b[i]);
                        normx = (normx > abs(x[i])) ? normx : abs(x[i]);
                }

                eps = epslon(1.0);
                residn = resid / (n * norma * normx * eps);

                if (residn > ref[size]) {
                        print("Validation failed");
                        print("Computed Norm Res = " + residn);
                        print("Reference Norm Res = " + ref[size]);
                }
                print("Computed Norm Res = " + residn);
                print("Reference Norm Res = " + ref[size]);
        }
        
        function JGFtidyup() {
                /*
                // Make sure large arrays are gc'd.
                a = null;
                b = null;
                x = null;
                ipvt = null;
                System.gc();
                */
        }

        function JGFrun(size) {
                JGFsetsize(size);
                JGFinitialise();
                JGFkernel();
                JGFvalidate();
        }
        
        
        function matgen(a, lda, n, b) {
                var norma;
                var init, i, j;

                init = 1325;
                norma = 0.0;
                /*
                 * Next two for() statements switched. Solver wants matrix in column
                 * order. --dmd 3/3/97
                 */
                for (i = 0; i < n; i++) {
                        for (j = 0; j < n; j++) {
                                init = 3125 * init % 65536;
                                a[j][i] = (init - 32768.0) / 16384.0;
                                norma = (a[j][i] > norma) ? a[j][i] : norma;
                        }
                }
                for (i = 0; i < n; i++) {
                        b[i] = 0.0;
                }
                for (j = 0; j < n; j++) {
                        for (i = 0; i < n; i++) {
                                b[i] += a[j][i];
                        }
                }

                return norma;
        }

        /*
         * dgefa factors a double precision matrix by gaussian elimination.
         *
         * dgefa is usually called by dgeco, but it can be called directly with a
         * saving in time if rcond is not needed. (time for dgeco) = (1 + 9/n)*(time
         * for dgefa) .
         *
         * on entry
         *
         * a double precision[n][lda] the matrix to be factored.
         *
         * lda integer the leading dimension of the array a .
         *
         * n integer the order of the matrix a .
         *
         * on return
         *
         * a an upper triangular matrix and the multipliers which were used to
         * obtain it. the factorization can be written a = l*u where l is a product
         * of permutation and unit lower triangular matrices and u is upper
         * triangular.
         *
         * ipvt integer[n] an integer vector of pivot indices.
         *
         * info integer = 0 normal value. = k if u[k][k] .eq. 0.0 . this is not an
         * error condition for this subroutine, but it does indicate that dgesl or
         * dgedi will divide by zero if called. use rcond in dgeco for a reliable
         * indication of singularity.
         *
         * linpack. this version dated 08/14/78. cleve moler, university of new
         * mexico, argonne national lab.
         *
         * functions
         *
         * blas daxpy,dscal,idamax
         */
        function dgefa(a,  lda,  n,  ipvt) {
                var col_k, col_j;
                var t;
                var j, k, kp1, l, nm1;
                var info;

                // gaussian elimination with partial pivoting

                info = 0;
                nm1 = n - 1;
                if (nm1 >= 0) {
                        for (k = 0; k < nm1; k++) {
                                col_k = a[k];
                                kp1 = k + 1;

                                // find l = pivot index

                                l = idamax(n - k, col_k, k, 1) + k;
                                ipvt[k] = l;

                                // zero pivot implies this column already triangularized

                                if (col_k[l] != 0) {

                                        // interchange if necessary

                                        if (l != k) {
                                                t = col_k[l];
                                                col_k[l] = col_k[k];
                                                col_k[k] = t;
                                        }

                                        // compute multipliers

                                        t = -1.0 / col_k[k];
                                        dscal(n - (kp1), t, col_k, kp1, 1);

                                        // row elimination with column indexing

                                        for (j = kp1; j < n; j++) {
                                                col_j = a[j];
                                                t = col_j[l];
                                                if (l != k) {
                                                        col_j[l] = col_j[k];
                                                        col_j[k] = t;
                                                }
                                                daxpy(n - (kp1), t, col_k, kp1, 1, col_j, kp1, 1);
                                        }
                                } else {
                                        info = k;
                                }
                        }
                }
                ipvt[n - 1] = n - 1;
                if (a[(n - 1)][(n - 1)] == 0)
                        info = n - 1;

                return info;
        }

        /*
         * dgesl solves the double precision system a * x = b or trans(a) * x = b
         * using the factors computed by dgeco or dgefa.
         *
         * on entry
         *
         * a double precision[n][lda] the output from dgeco or dgefa.
         *
         * lda integer the leading dimension of the array a .
         *
         * n integer the order of the matrix a .
         *
         * ipvt integer[n] the pivot vector from dgeco or dgefa.
         *
         * b double precision[n] the right hand side vector.
         *
         * job integer = 0 to solve a*x = b , = nonzero to solve trans(a)*x = b
         * where trans(a) is the transpose.
         *
         * on return
         *
         * b the solution vector x .
         *
         * error condition
         *
         * a division by zero will occur if the input factor contains a zero on the
         * diagonal. technically this indicates singularity but it is often caused
         * by improper arguments or improper setting of lda . it will not occur if
         * the subroutines are called correctly and if dgeco has set rcond .gt. 0.0
         * or dgefa has set info .eq. 0 .
         *
         * to compute inverse(a) * c where c is a matrix with p columns
         * dgeco(a,lda,n,ipvt,rcond,z) if (!rcond is too small){ for (j=0,j<p,j++)
         * dgesl(a,lda,n,ipvt,c[j][0],0); }
         *
         * linpack. this version dated 08/14/78 . cleve moler, university of new
         * mexico, argonne national lab.
         *
         * functions
         *
         * blas daxpy,ddot
         */
        function dgesl(a,  lda,  n,  ipvt,  b, job) {
                var t;
                var k, kb, l, nm1, kp1;

                nm1 = n - 1;
                if (job == 0) {

                        // job = 0 , solve a * x = b. first solve l*y = b

                        if (nm1 >= 1) {
                                for (k = 0; k < nm1; k++) {
                                        l = ipvt[k];
                                        t = b[l];
                                        if (l != k) {
                                                b[l] = b[k];
                                                b[k] = t;
                                        }
                                        kp1 = k + 1;
                                        daxpy(n - (kp1), t, a[k], kp1, 1, b, kp1, 1);
                                }
                        }

                        // now solve u*x = y

                        for (kb = 0; kb < n; kb++) {
                                k = n - (kb + 1);
                                b[k] /= a[k][k];
                                t = -b[k];
                                daxpy(k, t, a[k], 0, 1, b, 0, 1);
                        }
                } else {

                        // job = nonzero, solve trans(a) * x = b. first solve trans(u)*y = b

                        for (k = 0; k < n; k++) {
                                t = ddot(k, a[k], 0, 1, b, 0, 1);
                                b[k] = (b[k] - t) / a[k][k];
                        }

                        // now solve trans(l)*x = y

                        if (nm1 >= 1) {
                                for (kb = 1; kb < nm1; kb++) {
                                        k = n - (kb + 1);
                                        kp1 = k + 1;
                                        b[k] += ddot(n - (kp1), a[k], kp1, 1, b, kp1, 1);
                                        l = ipvt[k];
                                        if (l != k) {
                                                t = b[l];
                                                b[l] = b[k];
                                                b[k] = t;
                                        }
                                }
                        }
                }
        }

        /*
         * constant times a vector plus a vector. jack dongarra, linpack, 3/11/78.
         */
        function daxpy( n,  da,  dx,  dx_off,  incx, dy,  dy_off,  incy) {
                var i, ix, iy;

                if ((n > 0) && (da != 0)) {
                        if (incx != 1 || incy != 1) {

                                // code for unequal increments or equal increments not equal to
                                // 1

                                ix = 0;
                                iy = 0;
                                if (incx < 0)
                                        ix = (-n + 1) * incx;
                                if (incy < 0)
                                        iy = (-n + 1) * incy;
                                for (i = 0; i < n; i++) {
                                        dy[iy + dy_off] += da * dx[ix + dx_off];
                                        ix += incx;
                                        iy += incy;
                                }
                                return;
                        } else {

                                // code for both increments equal to 1

                                for (i = 0; i < n; i++)
                                        dy[i + dy_off] += da * dx[i + dx_off];
                        }
                }
        }

        /*
         * forms the dot product of two vectors. jack dongarra, linpack, 3/11/78.
         */
        function ddot( n,  dx,  dx_off,  incx,  dy,      dy_off,  incy) {
                var dtemp;
                var i, ix, iy;

                dtemp = 0;

                if (n > 0) {

                        if (incx != 1 || incy != 1) {

                                // code for unequal increments or equal increments not equal to
                                // 1

                                ix = 0;
                                iy = 0;
                                if (incx < 0)
                                        ix = (-n + 1) * incx;
                                if (incy < 0)
                                        iy = (-n + 1) * incy;
                                for (i = 0; i < n; i++) {
                                        dtemp += dx[ix + dx_off] * dy[iy + dy_off];
                                        ix += incx;
                                        iy += incy;
                                }
                        } else {

                                // code for both increments equal to 1

                                for (i = 0; i < n; i++)
                                        dtemp += dx[i + dx_off] * dy[i + dy_off];
                        }
                }
                return (dtemp);
        }

        /*
         * scales a vector by a constant. jack dongarra, linpack, 3/11/78.
         */
        function dscal( n,  da,  dx,  dx_off,  incx) {
                var i, nincx;

                if (n > 0) {
                        if (incx != 1) {

                                // code for increment not equal to 1

                                nincx = n * incx;
                                for (i = 0; i < nincx; i += incx)
                                        dx[i + dx_off] *= da;
                        } else {

                                // code for increment equal to 1

                                for (i = 0; i < n; i++)
                                        dx[i + dx_off] *= da;
                        }
                }
        }

        /*
         * finds the index of element having max. absolute value. jack dongarra,
         * linpack, 3/11/78.
         */
        function idamax( n,  dx,  dx_off,  incx) {
                var dmax, dtemp;
                var i, ix, itemp = 0;

                if (n < 1) {
                        itemp = -1;
                } else if (n == 1) {
                        itemp = 0;
                } else if (incx != 1) {

                        // code for increment not equal to 1

                        dmax = abs(dx[0 + dx_off]);
                        ix = 1 + incx;
                        for (i = 1; i < n; i++) {
                                dtemp = abs(dx[ix + dx_off]);
                                if (dtemp > dmax) {
                                        itemp = i;
                                        dmax = dtemp;
                                }
                                ix += incx;
                        }
                } else {

                        // code for increment equal to 1

                        itemp = 0;
                        dmax = abs(dx[0 + dx_off]);
                        for (i = 1; i < n; i++) {
                                dtemp = abs(dx[i + dx_off]);
                                if (dtemp > dmax) {
                                        itemp = i;
                                        dmax = dtemp;
                                }
                        }
                }
                return (itemp);
        }

        /*
         * estimate unit roundoff in quantities of size x.
         *
         * this program should function properly on all systems satisfying the
         * following two assumptions, 1. the base used in representing dfloating
         * point numbers is not a power of three. 2. the quantity a in statement 10
         * is represented to the accuracy used in dfloating point variables that are
         * stored in memory. the statement number 10 and the go to 10 are intended
         * to force optimizing compilers to generate code satisfying assumption 2.
         * under these assumptions, it should be true that, a is not exactly equal
         * to four-thirds, b has a zero for its last bit or digit, c is not exactly
         * equal to one, eps measures the separation of 1.0 from the next larger
         * dfloating point number. the developers of eispack would appreciate being
         * informed about any systems where these assumptions do not hold.
         *
         * **************************************************************** this
         * routine is one of the auxiliary routines used by eispack iii to avoid
         * machine dependencies.
         * ****************************************************************
         *
         * this version dated 4/6/83.
         */
        function epslon(x)
        {
                var a, b, c, eps;

                a = 4.0e0 / 3.0e0;
                eps = 0;
                while (eps == 0)
                {
                        b = a - 1.0;
                        c = b + b + b;
                        eps = abs(c - 1.0);
                }
                var ret = eps * abs(x);
                return ret;
        }

        /*
         * purpose: multiply matrix m times vector x and add the result to vector y.
         *
         * parameters:
         *
         * n1 integer, number of elements in vector y, and number of rows in matrix
         * m
         *
         * y double [n1], vector of length n1 to which is added the product m*x
         *
         * n2 integer, number of elements in vector x, and number of columns in
         * matrix m
         *
         * ldm integer, leading dimension of array m
         *
         * x double [n2], vector of length n2
         *
         * m double [ldm][n2], matrix of n1 rows and n2 columns
         */
        function dmxpy( n1,  y,  n2,  ldm,  x,  m) {
                var j, i;

                // cleanup odd vector
                for (j = 0; j < n2; j++) {
                        for (i = 0; i < n1; i++) {
                                y[i] += x[j] * m[j][i];
                        }
                }
        }
