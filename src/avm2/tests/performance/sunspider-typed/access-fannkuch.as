/* The Great Computer Language Shootout
   http://shootout.alioth.debian.org/
   contributed by Isaac Gouy */

package {

        function fannkuch(n:int):int {
           var check:int = 0;
           var perm:Array = new Array(n);
           var perm1:Array = new Array(n);
           var count:Array = new Array(n);
           var maxPerm:Array = new Array(n);
           var maxFlipsCount:int = 0;
           var m:int = n - 1;
           var s:String = "";

           for (var i:int = 0; i < n; i++) perm1[i] = i;
           var r:int = n;

           while (true) {
              // write-out the first 30 permutations
              if (check < 30){
                 for(var i:int=0; i<n; i++) s += (perm1[i]+1).toString();
                 check++;
              }

              while (r != 1) { count[r - 1] = r; r--; }
              if (!(perm1[0] == 0 || perm1[m] == m)) {
                 for (var i:int = 0; i < n; i++) perm[i] = perm1[i];

                 var flipsCount:int = 0;
                 var k:int;

                 while (!((k = perm[0]) == 0)) {
                    var k2:int = (k + 1) >> 1;
                    for (var i = 0; i < k2; i++) {
                       var temp:int = perm[i]; perm[i] = perm[k - i]; perm[k - i] = temp;
                    }
                    flipsCount++;
                 }

                 if (flipsCount > maxFlipsCount) {
                    maxFlipsCount = flipsCount;
                    for (var i = 0; i < n; i++) maxPerm[i] = perm1[i];
                 }
              }

              while (true) {
                 if (r == n) return maxFlipsCount;
                 var perm0:int = perm1[0];
                 var i:int = 0;
                 while (i < r) {
                    var j:int = i + 1;
                    perm1[i] = perm1[j];
                    i = j;
                 }
                 perm1[r] = perm0;

                 count[r] = count[r] - 1;
                 if (count[r] > 0) break;
                 r++;
              }
           }
        }

        var start:Number = new Date();
        var res:int = fannkuch(10);
        var totaltime:Number = new Date() - start;


        print("fannkuch(8)="+res);
        if (res==22) {
            print("PASSED res="+res);
        } else {
            print("FAILED expected fannkuch(8)=22 got "+res);
        }
/*
        print("fannkuch(8)="+res);
        if (res==22) {
            print("metric time "+totaltime);
        } else {
            print("error expected fannkuch(8)=22 got "+res);
        }
*/
}
