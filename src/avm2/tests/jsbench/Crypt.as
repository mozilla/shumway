        var size;
        var DEBUG=true;
        var datasizes = new Array(4);
        datasizes[0] = 3000000;
        datasizes[1] = 20000000;
        datasizes[2] = 50000000;
        datasizes[3] = 1000000;
                
                        // Declare class data. Byte buffer plain1 holds the original
        // data for encryption, crypt1 holds the encrypted data, and
        // plain2 holds the decrypted data, which should match plain1
        // byte for byte.

        var array_rows;

        var plain1; // byte Buffer for plaintext data.

        var crypt1; // byte Buffer for encrypted data.

        var plain2; // byte Buffer for decrypted data.

        var userkey; // short Key for encryption/decryption.

        var Z; // int Encryption subkey (userkey derived).

        var RANDOM_SEED = 10101010;
        var lastRandom=RANDOM_SEED;
        var DK;

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
        function JGFsetsize(sizel) {
                size = sizel;
        }

        function JGFinitialise() {
                array_rows = datasizes[size];
                buildTestData();
        }
        function JGFkernel() {
                Do();
        }

        function JGFvalidate() {
                var error;

                error = false;
                for (var i = 0; i < array_rows; i++) {
                        error = (plain1[i] != plain2[i]);
                        if (error) {
                                print("Validation failed");
                                print("Original Byte " + i + " = " + plain1[i]);
                                print("Encrypted Byte " + i + " = " + crypt1[i]);
                                print("Decrypted Byte " + i + " = " + plain2[i]);
                                break;
                        }
                }
        return !error;
        }


        function JGFrun(size) {
                JGFsetsize(size);
                JGFinitialise();
                JGFkernel();
                JGFvalidate();
        }
        
                function Do() {
                cipher_idea(plain1, crypt1, Z); // Encrypt plain1.
                //Alex: Since javascript doesn't handle specific byte type this converts whatever is
                //Alx: returned in to a byte. So cuts of extra stuff that is not needed.
                /*
                for(var i=0;i<crypt1.length;i++)
                {
                        crypt1[i] = crypt1[i]&0xFF;
                }*/
                //printarray("plain1",plain1);
                //printarray("crypt1",crypt1);
                cipher_idea(crypt1, plain2, DK); // Decrypt.
                //Alex: Since javascript doesn't handle specific byte type this converts whatever is
                //Alx: returned in to a byte. So cuts of extra stuff that is not needed.
                /*
                for(var i=0;i<crypt1.length;i++)
                {
                        plain2[i] = plain2[i]&0xFF;
                }*/
                //printarray("plain2: ",plain2);

        }

        /*
         * buildTestData
         *
         * Builds the data used for the test -- each time the test is run.
         */

        function buildTestData() {

                // Create three byte arrays that will be used (and reused) for
                // encryption/decryption operations.

                plain1 = new Array(array_rows);
                crypt1 = new Array(array_rows);
                plain2 = new Array(array_rows);

                //Random rndnum = new Random(136506717L); // Create random number
                                                                                                // generator.

                // Allocate three arrays to hold keys: userkey is the 128-bit key.
                // Z is the set of 16-bit encryption subkeys derived from userkey,
                // while DK is the set of 16-bit decryption subkeys also derived
                // from userkey. NOTE: The 16-bit values are stored here in
                // 32-bit int arrays so that the values may be used in calculations
                // as if they are unsigned. Each 64-bit block of plaintext goes
                // through eight processing rounds involving six of the subkeys
                // then a final output transform with four of the keys; (8 * 6)
                // + 4 = 52 subkeys.

                userkey = new Array(8); // User key has 8 16-bit shorts.
                Z = new Array(52); // Encryption subkey (user key derived).
                DK = new Array(52); // Decryption subkey (user key derived).

                // Generate user key randomly; eight 16-bit values in an array.

                for (var i = 0; i < 8; i++) {
                        // Again, the random number function returns int. Converting
                        // to a short type preserves the bit pattern in the lower 16
                        // bits of the int and discards the rest.

                        userkey[i] = _randomInt()%65535;
                        //print("user Key: "+userkey[i]);
                }

                // Compute encryption and decryption subkeys.

                calcEncryptKey();
                calcDecryptKey();

                // Fill plain1 with "text."
                for (var i = 0; i < array_rows; i++) {
                        //Alex: Since JS doesn't cut of bytes if value is stored in byte array I need to do it manually.
                        plain1[i] = i&0xFF;
                        //Alex makes sure all the values are 1 byte long since this is suppose to be byte array
                        //plain1[i]= (plain1[i]<<24);
                        //plain1[i]=(plain1[i]>>>24);
                        // Converting to a byte
                        // type preserves the bit pattern in the lower 8 bits of the
                        // int and discards the rest.
                }
                //print("exiting buildTestData");
                //printarray("plain1",plain1);
                //printarray("userkey",userkey);
        }

        /*
         * calcEncryptKey
         *
         * Builds the 52 16-bit encryption subkeys Z[] from the user key and stores
         * in 32-bit int array. The routing corrects an error in the source code in
         * the Schnier book. Basically, the sense of the 7- and 9-bit shifts are
         * reversed. It still works reversed, but would encrypted code would not
         * decrypt with someone else's IDEA code.
         */

        function calcEncryptKey() {
                var j; // Utility variable.

                for (var i = 0; i < 52; i++)
                        // Zero out the 52-int Z array.
                        Z[i] = 0;

                for (var i = 0; i < 8; i++) // First 8 subkeys are userkey itself.
                {
                        Z[i] = userkey[i] & 0xffff; // Convert "unsigned"
                        // short to int.
                }
                //printarray("userkey",userkey);
                //printarray("Z array",Z);
                // Each set of 8 subkeys thereafter is derived from left rotating
                // the whole 128-bit key 25 bits to left (once between each set of
                // eight keys and then before the last four). Instead of actually
                // rotating the whole key, this routine just grabs the 16 bits
                // that are 25 bits to the right of the corresponding subkey
                // eight positions below the current subkey. That 16-bit extent
                // straddles two array members, so bits are shifted left in one
                // member and right (with zero fill) in the other. For the last
                // two subkeys in any group of eight, those 16 bits start to
                // wrap around to the first two members of the previous eight.

                for (var i = 8; i < 52; i++) {
                        j = i % 8;
                        if (j < 6) {
                                Z[i] = ((Z[i - 7] >>> 9) | (Z[i - 6] << 7)) & 0xFFFF; // Just 16 bits.
                                continue; // Next iteration.
                        }

                        if (j == 6) // Wrap to beginning for second chunk.
                        {
                                Z[i] = ((Z[i - 7] >>> 9) | (Z[i - 14] << 7)) & 0xFFFF;
                                continue;
                        }

                        // j == 7 so wrap to beginning for both chunks.

                        Z[i] = ((Z[i - 15] >>> 9) | (Z[i - 14] << 7)) & 0xFFFF;
                }
                //printarray("Encryption key: ",Z);
        }

        /*
         * calcDecryptKey
         *
         * Builds the 52 16-bit encryption subkeys DK[] from the encryption- subkeys
         * Z[]. DK[] is a 32-bit int array holding 16-bit values as unsigned.
         */

        function calcDecryptKey() {
                var j, k; // Index counters.
                var t1, t2, t3; // Temps to hold decrypt subkeys.

                t1 = inv(Z[0]); // Multiplicative inverse (mod x10001).
                t2 = -Z[1] & 0xffff; // Additive inverse, 2nd encrypt subkey.
                t3 = -Z[2] & 0xffff; // Additive inverse, 3rd encrypt subkey.

                DK[51] = inv(Z[3]); // Multiplicative inverse (mod x10001).
                DK[50] = t3;
                DK[49] = t2;
                DK[48] = t1;

                j = 47; // Indices into temp and encrypt arrays.
                k = 4;
                for (var i = 0; i < 7; i++) {
                        t1 = Z[k++];
                        DK[j--] = Z[k++];
                        DK[j--] = t1;
                        t1 = inv(Z[k++]);
                        t2 = -Z[k++] & 0xffff;
                        t3 = -Z[k++] & 0xffff;
                        DK[j--] = inv(Z[k++]);
                        DK[j--] = t2;
                        DK[j--] = t3;
                        DK[j--] = t1;
                }

                t1 = Z[k++];
                DK[j--] = Z[k++];
                DK[j--] = t1;
                t1 = inv(Z[k++]);
                t2 = -Z[k++] & 0xffff;
                t3 = -Z[k++] & 0xffff;
                DK[j--] = inv(Z[k++]);
                DK[j--] = t3;
                DK[j--] = t2;
                DK[j--] = t1;
                //print("Decryption key");
                //printarray("DK: ",DK);
        }

        /*
         * cipher_idea
         *
         * IDEA encryption/decryption algorithm. It processes plaintext in 64-bit
         * blocks, one at a time, breaking the block into four 16-bit unsigned
         * subblocks. It goes through eight rounds of processing using 6 new subkeys
         * each time, plus four for last step. The source text is in array text1,
         * the destination text goes into array text2 The routine represents 16-bit
         * subblocks and subkeys as type int so that they can be treated more easily
         * as unsigned. Multiplication modulo 0x10001 interprets a zero sub-block as
         * 0x10000; it must to fit in 16 bits.
         */

        function cipher_idea(text1, text2, key)

        {

                var i1 = 0; // Index into first text array.
                var i2 = 0; // Index varo second text array.
                var ik; // Index varo key array.
                var x1, x2, x3, x4, t1, t2; // Four "16-bit" blocks, two temps.
                var r; // Eight rounds of processing.

                for (var i = 0; i < text1.length; i += 8) {
                        ik = 0; // Restart key index.
                        r = 8; // Eight rounds of processing.

                        // Load eight plain1 bytes as four 16-bit "unsigned" varegers.
                        // Masking with 0xff prevents sign extension with cast to var.

                        x1 = text1[i1++] & 0xff; // Build 16-bit x1 from 2 bytes,
                        x1 |= (text1[i1++] & 0xff) << 8; // assuming low-order byte
                                                                                                // first.
                        x2 = text1[i1++] & 0xff;
                        x2 |= (text1[i1++] & 0xff) << 8;
                        x3 = text1[i1++] & 0xff;
                        x3 |= (text1[i1++] & 0xff) << 8;
                        x4 = text1[i1++] & 0xff;
                        x4 |= (text1[i1++] & 0xff) << 8;

                        do {
                                // 1) Multiply (modulo 0x10001), 1st text sub-block
                                // with 1st key sub-block.

                                x1 = x1 * key[ik++] % 0x10001 & 0xffff;

                                // 2) Add (modulo 0x10000), 2nd text sub-block
                                // with 2nd key sub-block.

                                x2 = x2 + key[ik++] & 0xffff;

                                // 3) Add (modulo 0x10000), 3rd text sub-block
                                // with 3rd key sub-block.

                                x3 = x3 + key[ik++] & 0xffff;

                                // 4) Multiply (modulo 0x10001), 4th text sub-block
                                // with 4th key sub-block.

                                x4 = x4 * key[ik++] % 0x10001 & 0xffff;

                                // 5) XOR results from steps 1 and 3.

                                t2 = x1 ^ x3;

                                // 6) XOR results from steps 2 and 4.
                                // Included in step 8.

                                // 7) Multiply (modulo 0x10001), result of step 5
                                // with 5th key sub-block.

                                t2 =  t2 * key[ik++] % 0x10001 & 0xffff;

                                // 8) Add (modulo 0x10000), results of steps 6 and 7.

                                t1 = t2 + (x2 ^ x4) & 0xffff;

                                // 9) Multiply (modulo 0x10001), result of step 8
                                // with 6th key sub-block.

                                t1 = t1 * key[ik++] % 0x10001 & 0xffff;

                                // 10) Add (modulo 0x10000), results of steps 7 and 9.

                                t2 = t1 + t2 & 0xffff;

                                // 11) XOR results from steps 1 and 9.

                                x1 ^= t1;

                                // 14) XOR results from steps 4 and 10. (Out of order).

                                x4 ^= t2;

                                // 13) XOR results from steps 2 and 10. (Out of order).

                                t2 ^= x2;

                                // 12) XOR results from steps 3 and 9. (Out of order).

                                x2 = x3 ^ t1;

                                x3 = t2; // Results of x2 and x3 now swapped.

                        } while (--r != 0); // Repeats seven more rounds.

                        // Final output transform (4 steps).

                        // 1) Multiply (modulo 0x10001), 1st text-block
                        // with 1st key sub-block.

                        x1 =  x1 * key[ik++] % 0x10001 & 0xffff;

                        // 2) Add (modulo 0x10000), 2nd text sub-block
                        // with 2nd key sub-block. It says x3, but that is to undo swap
                        // of subblocks 2 and 3 in 8th processing round.

                        x3 = x3 + key[ik++] & 0xffff;

                        // 3) Add (modulo 0x10000), 3rd text sub-block
                        // with 3rd key sub-block. It says x2, but that is to undo swap
                        // of subblocks 2 and 3 in 8th processing round.

                        x2 = x2 + key[ik++] & 0xffff;

                        // 4) Multiply (modulo 0x10001), 4th text-block
                        // with 4th key sub-block.

                        x4 = x4 * key[ik++] % 0x10001 & 0xffff;

                        // Repackage from 16-bit sub-blocks to 8-bit byte array text2.
                        //Alex: & by FF so ony lower two bytes are stored.
                        //Alex: in Java this happens automatically when casted to byte
                        text2[i2++] =  x1&0xFF;
                        text2[i2++] =  (x1 >>> 8);
                        text2[i2++] =  x3&0xFF; // x3 and x2 are switched
                        text2[i2++] =  (x3 >>> 8); // only in name.
                        text2[i2++] =  x2&0xFF;
                        text2[i2++] =  (x2 >>> 8);
                        text2[i2++] = x4&0xFF;
                        text2[i2++] = (x4 >>> 8);

                } // End for loop.

        } // End routine.

        /*
         * mul
         *
         * Performs multiplication, modulo (2**16)+1. This code is structured on the
         * assumption that untaken branches are cheaper than taken branches, and
         * that the compiler doesn't schedule branches. Java: Must work with 32-bit
         * var and one 64-bit long to keep 16-bit values and their products
         * "unsigned." The routine assumes that both a and b could fit in 16 bits
         * even though they come in as 32-bit vars. Lots of "& 0xFFFF" masks here to
         * keep things 16-bit. Also, because the routine stores mod (2**16)+1
         * results in a 2**16 space, the result is truncated to zero whenever the
         * result would zero, be 2**16. And if one of the multiplicands is 0, the
         * result is not zero, but (2**16) + 1 minus the other multiplicand (sort of
         * an additive inverse mod 0x10001).
         *
         * NOTE: The java conversion of this routine works correctly, but is half
         * the speed of using Java's modulus division function (%) on the
         * multiplication with a 16-bit masking of the result--running in the
         * Symantec Caje IDE. So it's not called for now; the test uses Java %
         * instead.
         */

        function mul(a, b){
                var p; // Large enough to catch 16-bit multiply
                // without hitting sign bit.
                if (a != 0) {
                        if (b != 0) {
                                p =  a * b;
                                b =  p & 0xFFFF; // Lower 16 bits.
                                a =  p >>> 16; // Upper 16 bits.

                                return (b - a + (b < a ? 1 : 0) & 0xFFFF);
                        } else
                                return ((1 - a) & 0xFFFF); // If b = 0, then same as
                        // 0x10001 - a.
                } else
                        // If a = 0, then return
                        return ((1 - b) & 0xFFFF); // same as 0x10001 - b.
        }

        /*
         * inv
         *
         * Compute multiplicative inverse of x, modulo (2**16)+1 using extended
         * Euclid's GCD (greatest common divisor) algorithm. It is unrolled twice to
         * avoid swapping the meaning of the registers. And some subtracts are
         * changed to adds. Java: Though it uses signed 32-bit vars, the
         * varerpretation of the bits within is strictly unsigned 16-bit.
         */

        function inv(x) {
                var t0, t1;
                var q, y;

                if (x <= 1) // Assumes positive x.
                        return (x); // 0 and 1 are self-inverse.
                /* (2**16+1)/x; x is >= 2, so fits 16 bits.*/
                t1 = Math.floor(0x10001 / x);
                y = 0x10001 % x;
                if (y == 1)
                        return ((1 - t1) & 0xFFFF);

                t0 = 1;
                do {
                        q = Math.floor(x / y);
                        x = x % y;
                        t0 += q * t1;
                        if (x == 1)
                                return (t0);
                        q = Math.floor(y / x);
                        y = y % x;
                        t1 += q * t0;
                } while (y != 1);

                return ((1 - t1) & 0xFFFF);
        }
        function printarray(_name,_data)
        {
                
                var _length =_data.length;
                print(_name);
                for(var i=0;i<_length;i++)
                {
                        print(i+" element:"+_data[i]);
                }
        }
        