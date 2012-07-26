/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED BY APPLE COMPUTER, INC. ``AS IS'' AND ANY
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
package {
  var loops:int = 15
  var nx:int = 120
  var nz:int = 120

  function morph(a:Array, f:Number):void {
      var PI2nx:Number = Math.PI * 8/nx
      //var sin:Function = Math.sin
      var f30:Number = -(50 * Math.sin(f*Math.PI*2))
      
      for (var i:int = 0; i < nz; ++i) {
          for (var j:int = 0; j < nx; ++j) {
              a[3*(i*nx+j)+1]    = Math.sin((j-1) * PI2nx ) * -f30
          }
      }
  }

  function run3dMorph():int {
    
    var _sunSpiderStartDate:int = (new Date).getTime();
    
    var a:Array = new Array(nx*nz*3);
    for (var i:int=0; i < nx*nz*3; ++i)
        a[i] = 0

    for (var i:int = 0; i < loops; ++i) {
        morph(a, i/loops)
    }

    var testOutput:Number = 0;
    for (var i:int = 0; i < nx; i++)
        testOutput += a[3*(i*nx+i)+1];
    a = null;

    var _sunSpiderInterval:int = (new Date).getTime() - _sunSpiderStartDate;
 
 // verify test result
    if (Math.abs(testOutput-6.750155989720952e-14)>0.00001) {
      print("FAILED Expected 6.750155989720952e-14 Got: "+testOutput);
    } else {
      print("PASSED");
    }

 /*   
    // verify test result
    if (Math.abs(testOutput-6.750155989720952e-14)>0.00001) {
      print("Test validation failed.  Expected 6.750155989720952e-14 Got: "+testOutput);
    } else {
      print("metric time "+ _sunSpiderInterval);
    }
  */
  }

run3dMorph();

}
