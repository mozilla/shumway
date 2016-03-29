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

/*
 * Copyright (C) Rich Moore.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY CONTRIBUTORS ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE COMPUTER, INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/////. Start CORDIC
package {
  var AG_CONST:Number = 0.6072529350;

  function FIXED(X:Number):Number
  {
    return X * 65536.0;
  }

  function FLOAT(X:Number):Number
  {
    return X / 65536.0;
  }

  function DEG2RAD(X:Number):Number
  {
    return 0.017453 * (X);
  }


  var Angles:Array = [
    FIXED(45.0), FIXED(26.565), FIXED(14.0362), FIXED(7.12502),
    FIXED(3.57633), FIXED(1.78991), FIXED(0.895174), FIXED(0.447614),
    FIXED(0.223811), FIXED(0.111906), FIXED(0.055953),
    FIXED(0.027977)
                ];

  function cordicsincos():Number {
      var X:Number;
      var Y:Number;
      var TargetAngle:Number;
      var CurrAngle:Number;
      var Step:int;
   
      X = FIXED(AG_CONST);         /* AG_CONST * cos(0) */
      Y = 0;                       /* AG_CONST * sin(0) */

      TargetAngle = FIXED(28.027);
      CurrAngle = 0;
      for (Step = 0; Step < 12; Step++) {
          var NewX:Number;
          if (TargetAngle > CurrAngle) {
              NewX = X - (Y >> Step);
              Y = (X >> Step) + Y;
              X = NewX;
              CurrAngle += Angles[Step];
          } else {
              NewX = X + (Y >> Step);
              Y = -(X >> Step) + Y;
              X = NewX;
              CurrAngle -= Angles[Step];
          }
      }
      return CurrAngle;
  }

  ///// End CORDIC

  function cordic( runs:int ):int {
    var start:int = (new Date).getTime();

    for ( var i:int = 0 ; i < runs ; i++ ) {
        cordicsincos();
    }

    var end:int = (new Date).getTime();

    return end - start;
  }

  
  function runMathCordic():int {

    var _sunSpiderStartDate:int = (new Date).getTime();
    cordic(25000);
    var _sunSpiderInterval:int = (new Date).getTime() - _sunSpiderStartDate;

    return _sunSpiderInterval;
  }

  if (Math.abs(cordicsincos() - 1834995.3515519998) < 0.00001) {
    print("PASSED ");
  } else {
    print("FAILED Expected: 1834995.3515519998 Got: "+cordicsincos());
  }

/*
  if (Math.abs(cordicsincos() - 1834995.3515519998) < 0.00001) {
    print("metric time "+runMathCordic());
  } else {
    print("Test validation failed. Expected: 1834995.3515519998 Got: "+cordicsincos());
  }
*/

}
