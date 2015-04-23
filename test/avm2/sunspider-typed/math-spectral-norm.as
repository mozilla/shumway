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
// http://shootout.alioth.debian.org/
//
// contributed by Ian Osgood
package {
  function Asn(i:int,j:int):Number {
    return 1/((i+j)*(i+j+1)/2+i+1);
  }

  function Au(u:Array, v:Array):void {
    for (var i:int=0; i<u.length; ++i) {
      var t:Number = 0;
      for (var j:int=0; j<u.length; ++j)
        t += Asn(i,j) * u[j];
      v[i] = t;
    }
  }

  function Atu(u:Array, v:Array):void {
    for (var i:int=0; i<u.length; ++i) {
      var t:Number = 0;
      for (var j:int=0; j<u.length; ++j)
        t += Asn(j,i) * u[j];
      v[i] = t;
    }
  }

  function AtAu(u:Array, v:Array, w:Array):void {
    Au(u,w);
    Atu(w,v);
  }

  function spectralnorm(n:int):Number {
    var i:int;
    var u:Array = new Array(n);
    var v:Array = new Array(n);
    var w:Array = new Array(n);
    var vv:Number=0, vBv:Number=0;
    for (i=0; i<n; ++i) {
      u[i] = 1; v[i] = w[i] = 0;
    }
    for (i=0; i<10; ++i) {
      AtAu(u,v,w);
      AtAu(v,u,w);
    }
    for (i=0; i<n; ++i) {
      vBv += u[i]*v[i];
      vv  += v[i]*v[i];
    }
    return Math.sqrt(vBv/vv);
  }

  function runMathSpectralNorm():int {
    var _sunSpiderStartDate:int = (new Date).getTime();
    
    for (var i:int = 6; i <= 48; i *= 2) {
      spectralnorm(i);
    }
    
    var _sunSpiderInterval:int = (new Date).getTime() - _sunSpiderStartDate;
    return _sunSpiderInterval;
  }


  
  function verifyTest():Boolean {
    var result:Number = spectralnorm(10);
    var expectedResult:Number = 1.2718440192507248;
    if (result !== expectedResult) {
      print('Test verification failed. spectralnorm(10):  Expected: '+expectedResult+' Got: '+result);
      return false;
    }
    return true;
  }

  print("PASSED");
  if (verifyTest()) {
    print("PASSED");
  } else {
    print("FAILED");
  }

  /*
  if (verifyTest()) {
    print("metric time " + runMathSpectralNorm());
  }
  */
}
