
// Copyright (c) 2004 by Arthur Langereis (arthur_ext at domain xfinitegames, tld com

// 1 op = 6 ANDs, 3 SHRs, 3 SHLs, 4 assigns, 2 ADDs
// O(1)

package {
        function fast3bitlookup(b:int):int {
        var c:int, bi3b:int = 0xE994; // 0b1110 1001 1001 0100; // 3 2 2 1  2 1 1 0
        c  = 3 & (bi3b >> ((b << 1) & 14));
        c += 3 & (bi3b >> ((b >> 2) & 14));
        c += 3 & (bi3b >> ((b >> 5) & 6));
        return c;

        /*
        lir4,0xE994; 9 instructions, no memory access, minimal register dependence, 6 shifts, 2 adds, 1 inline assign
        rlwinmr5,r3,1,28,30
        rlwinmr6,r3,30,28,30
        rlwinmr7,r3,27,29,30
        rlwnmr8,r4,r5,30,31
        rlwnmr9,r4,r6,30,31
        rlwnmr10,r4,r7,30,31
        addr3,r8,r9
        addr3,r3,r10
        */
        }


        function TimeFunc(func: Function): int {
          var res: int;
          var x: int, y: int, t: int;
          var xMax: int = 500 * 4;
          var yMax: int = 256 * 4;

          for (x = 0; x < xMax; x++) {
            for (y = 0; y < yMax; y++) {
              res = func(y);
            }
          }
          return res;
        }

        var start:Number = new Date();
        var res:int = TimeFunc(fast3bitlookup);
        var totaltime:Number = new Date() - start;


        if (res==8) {
           print("PASSED res="+res);
        } else {
           print("FAILED fast3bitlookup() expected 8 got "+res);
        }
/*
        if (res==8) {
           print("metric time "+totaltime);
        } else {
           print("error fast3bitlookup() expected 8 got "+res);
        }
*/
}
