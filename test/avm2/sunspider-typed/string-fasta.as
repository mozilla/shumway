/*
 Copyright (C) 2007 Apple Inc.  All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY APPLE COMPUTER, INC. ``AS IS'' AND ANY
 EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE COMPUTER, INC. OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// The Great Computer Language Shootout
//  http://shootout.alioth.debian.org
//
//  Contributed by Ian Osgood

package {
  public class frequency {
    public var c:String;
    public var p:Number;
    public function frequency(c:String, p:Number) {
            this.c = c;
            this.p = p;
        }
  }


  var last:Number = 42, A:Number = 3877, C:Number = 29573, M:Number = 139968;

  function rand(max:Number):Number {
    last = (last * A + C) % M;
    return max * last / M;
  }

  var ALU:String =
    "GGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGG" +
    "GAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGA" +
    "CCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAAT" +
    "ACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCA" +
    "GCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGG" +
    "AGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCC" +
    "AGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAA";

  var IUB:Array = new Array(15);
  IUB[0] = new frequency("a", 0.27);
  IUB[1] = new frequency("c", 0.12);
  IUB[2] = new frequency("g", 0.12);
  IUB[3] = new frequency("t", 0.27);
  IUB[4] = new frequency("B", 0.02);
  IUB[5] = new frequency("D", 0.02);
  IUB[6] = new frequency("H", 0.02);
  IUB[7] = new frequency("K", 0.02);
  IUB[8] = new frequency("M", 0.02);
  IUB[9] = new frequency("N", 0.02);
  IUB[10] = new frequency("R", 0.02);
  IUB[11] = new frequency("S", 0.02);
  IUB[12] = new frequency("V", 0.02);
  IUB[13] = new frequency("W", 0.02);
  IUB[14] = new frequency("Y", 0.02);


  var HomoSap:Array = new Array();
  HomoSap.push(new frequency("a", 0.3029549426680));
  HomoSap.push(new frequency("c", 0.1979883004921));
  HomoSap.push(new frequency("g", 0.1975473066391));
  HomoSap.push(new frequency("t", 0.3015094502008));


  function makeCumulative(table:Array):void {
    var cp:Number = 0.0;
    for (var i:int = 0; i < table.length; i++) {
      cp += table[i].p;
      table[i].p = cp;
    }
  }

  function fastaRepeat(n:int, seq:String):String {
    var seqi:int = 0, lenOut:int = 60;
    var ret:String;
    while (n>0) {
      if (n<lenOut) lenOut = n;
      if (seqi + lenOut < seq.length) {
        ret = seq.substring(seqi, seqi+lenOut);
        seqi += lenOut;
      } else {
        var s:String = seq.substring(seqi);
        seqi = lenOut - s.length;
        ret = s + seq.substring(0, seqi);
      }
      n -= lenOut;
    }
    return ret;
  }

  function fastaRandom(n:int, table:Array):String {
    var line:Array = new Array(60);
    var ret:String;
    makeCumulative(table);
    while (n>0) {
      if (n<line.length) line = new Array(n);
      for (var i:int=0; i<line.length; i++) {
        var r:Number = rand(1);
        for (var c:int=0; c < table.length; c++){
          if (r < table[c].p) {
            line[i] = table[c].c;
            break;
          }
        }
      }
      ret = line.join('');
      n -= line.length;
    }
    return ret;
  }

  function runStringFasta():int {
      
      var _sunSpiderStartDate:int = (new Date).getTime();
  
      var ret:String;
  
      var count:Number = 7;
      ret = fastaRepeat(2*count*100000, ALU);
      ret += fastaRandom(3*count*1000, IUB);
      ret += fastaRandom(5*count*1000, HomoSap);
  
      var _sunSpiderInterval:int = (new Date).getTime() - _sunSpiderStartDate;

      var expected:String = "CAAAAAGGCCGGGCGCGGTGVtttaDtKgcaaWaaaaatSccMcVatgtKgtaKgcgatatgtagtSaaaDttatacaaattggctatatttatgttgga";
      if (ret != expected) {
        print("FAILED.  Expected: "+expected+" Got: "+ret);
      } else {
        print("PASSED");
      }

/*      
      // verify test results
      var expected:String = "CAAAAAGGCCGGGCGCGGTGVtttaDtKgcaaWaaaaatSccMcVatgtKgtaKgcgatatgtagtSaaaDttatacaaattggctatatttatgttgga";
      if (ret != expected) {
        print("Test validation failed.  Expected: "+expected+" Got: "+ret);
      } else {
        print("metric time "+_sunSpiderInterval);
      }
*/
  }

runStringFasta();

}
