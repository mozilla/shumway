/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var tagHandler = (function () {
  return {
    /* End */                            0: undefined,
    /* ShowFrame */                      1: undefined,
    /* DefineShape */                    2: defineShape,
    /* PlaceObject */                    4: placeObject,
    /* RemoveObject */                   5: removeObject,
    /* DefineBits */                     6: defineImage,
    /* DefineButton */                   7: defineButton,
    /* JPEGTables */                     8: defineJPEGTables,
    /* SetBackgroundColor */             9: setBackgroundColor,
    /* DefineFont */                    10: defineFont,
    /* DefineText */                    11: defineLabel,
    /* DoAction */                      12: doAction,
    /* DefineFontInfo */                13: undefined,
    /* DefineSound */                   14: defineSound,
    /* StartSound */                    15: startSound,
    /* DefineButtonSound */             17: undefined,
    /* SoundStreamHead */               18: soundStreamHead,
    /* SoundStreamBlock */              19: soundStreamBlock,
    /* DefineBitsLossless */            20: defineBitmap,
    /* DefineBitsJPEG2 */               21: defineImage,
    /* DefineShape2 */                  22: defineShape,
    /* DefineButtonCxform */            23: undefined,
    /* Protect */                       24: undefined,
    /* PlaceObject2 */                  26: placeObject,
    /* RemoveObject2 */                 28: removeObject,
    /* DefineShape3 */                  32: defineShape,
    /* DefineText2 */                   33: defineLabel,
    /* DefineButton2 */                 34: defineButton,
    /* DefineBitsJPEG3 */               35: defineImage,
    /* DefineBitsLossless2 */           36: defineBitmap,
    /* DefineEditText */                37: defineText,
    /* DefineSprite */                  39: undefined,
    /* FrameLabel */                    43: frameLabel,
    /* SoundStreamHead2 */              45: soundStreamHead,
    /* DefineMorphShape */              46: defineShape,
    /* DefineFont2 */                   48: defineFont2,
    /* ExportAssets */                  56: undefined,
    /* ImportAssets */                  57: undefined,
    /* EnableDebugger */                58: undefined,
    /* DoInitAction */                  59: doAction,
    /* DefineVideoStream */             60: undefined,
    /* VideoFrame */                    61: undefined,
    /* DefineFontInfo2 */               62: undefined,
    /* EnableDebugger2 */               64: undefined,
    /* ScriptLimits */                  65: undefined,
    /* SetTabIndex */                   66: undefined,
    /* FileAttributes */                69: fileAttributes,
    /* PlaceObject3 */                  70: placeObject,
    /* ImportAssets2 */                 71: undefined,
    /* DoABC (undoc) */                 72: doABC,
    /* DefineFontAlignZones */          73: undefined,
    /* CSMTextSettings */               74: undefined,
    /* DefineFont3 */                   75: defineFont2,
    /* SymbolClass */                   76: symbolClass,
    /* Metadata */                      77: undefined,
    /* DefineScalingGrid */             78: defineScalingGrid,
    /* DoABC */                         82: doABC,
    /* DefineShape4 */                  83: defineShape,
    /* DefineMorphShape2 */             84: defineShape,
    /* DefineSceneAndFrameLabelData */  86: defineScene,
    /* DefineBinaryData */              87: undefined,
    /* DefineFontName */                88: undefined,
    /* StartSound2 */                   89: startSound,
    /* DefineBitsJPEG4 */               90: defineImage,
    /* DefineFont4 */                   91: undefined
  }

  function defineShape($bytes,$stream,$,swfVersion,tagCode) {
    $||($={})
    $.id=
      readUi16($bytes,$stream)
    var $0=$.bbox={}
    bbox($bytes, $stream, $0);
    var isMorph=
      $.isMorph=
      tagCode===46||tagCode===84
    if(isMorph){
      var $1=$.bboxMorph={}
      bbox($bytes, $stream, $1);
    }
    var hasStrokes=
      $.hasStrokes=
      tagCode===83||tagCode===84
    if(hasStrokes){
      var $2=$.strokeBbox={}
      bbox($bytes, $stream, $2);
      if(isMorph){
        var $3=$.strokeBboxMorph={}
        bbox($bytes, $stream, $3);
      }
      var reserved=
        readUb($bytes,$stream,5)
      $.fillWinding=
        readUb($bytes,$stream,1)
      $.nonScalingStrokes=
        readUb($bytes,$stream,1)
      $.scalingStrokes=
        readUb($bytes,$stream,1)
    }
    if(isMorph){
      $.offsetMorph=
        readUi32($bytes,$stream)
      var tmp=
        readUi8($bytes,$stream)
      if(tagCode>2&&tmp===255){
        var count=
          readUi16($bytes,$stream)
      }
      else{
        var count=
          tmp
      }
      var $4=
        $.fillStyles=
        []
      var $5=count
      while($5--){
        var $6={}
        var type=
          $6.type=
          readUi8($bytes,$stream)
        switch(type){
        case 0:
          if(tagCode>22||isMorph){
            var $7=$6.color={}
            $7.red=
              readUi8($bytes,$stream)
            $7.green=
              readUi8($bytes,$stream)
            $7.blue=
              readUi8($bytes,$stream)
            $7.alpha=
              readUi8($bytes,$stream)
          }
          else{
            var $8=$6.color={}
            $8.red=
              readUi8($bytes,$stream)
            $8.green=
              readUi8($bytes,$stream)
            $8.blue=
              readUi8($bytes,$stream)
            $8.alpha=
              255
          }
          if(isMorph){
            var $9=$6.colorMorph={}
            $9.red=
              readUi8($bytes,$stream)
            $9.green=
              readUi8($bytes,$stream)
            $9.blue=
              readUi8($bytes,$stream)
            $9.alpha=
              readUi8($bytes,$stream)
          }
          break
        case 16:
        case 18:
        case 19:

          var $10=$6.matrix={}
          align($bytes,$stream)
          var hasScale=
            readUb($bytes,$stream,1)
          if(hasScale){

            var bits=
              readUb($bytes,$stream,5)
            $10.a=
              readFb($bytes,$stream,bits)
            $10.d=
              readFb($bytes,$stream,bits)
          }
          else{

            $10.a=
              1
            $10.d=
              1
          }
          var hasRotate=
            readUb($bytes,$stream,1)
          if(hasRotate){

            var bits=
              readUb($bytes,$stream,5)
            $10.b=
              readFb($bytes,$stream,bits)
            $10.c=
              readFb($bytes,$stream,bits)
          }
          else{

            $10.b=
              0
            $10.c=
              0
          }
          var bits=
            readUb($bytes,$stream,5)
          var e=
            readSb($bytes,$stream,bits)
          var f=
            readSb($bytes,$stream,bits)
          $10.tx=
            e/20
          $10.ty=
            f/20
          align($bytes,$stream)
          if(isMorph){
            var $11=$6.matrixMorph={}
            align($bytes,$stream)
            var hasScale=
              readUb($bytes,$stream,1)
            if(hasScale){

              var bits=
                readUb($bytes,$stream,5)
              $11.a=
                readFb($bytes,$stream,bits)
              $11.d=
                readFb($bytes,$stream,bits)
            }
            else{

              $11.a=
                1
              $11.d=
                1
            }
            var hasRotate=
              readUb($bytes,$stream,1)
            if(hasRotate){

              var bits=
                readUb($bytes,$stream,5)
              $11.b=
                readFb($bytes,$stream,bits)
              $11.c=
                readFb($bytes,$stream,bits)
            }
            else{

              $11.b=
                0
              $11.c=
                0
            }
            var bits=
              readUb($bytes,$stream,5)
            var e=
              readSb($bytes,$stream,bits)
            var f=
              readSb($bytes,$stream,bits)
            $11.tx=
              e/20
            $11.ty=
              f/20
            align($bytes,$stream)
          }

          if(tagCode===83){

            $6.spreadMode=
              readUb($bytes,$stream,2)
            $6.interpolationMode=
              readUb($bytes,$stream,2)
          }
          else{

            var pad=
              readUb($bytes,$stream,4)
          }
          var count=
            $6.count=
            readUb($bytes,$stream,4)
          var $12=
            $6.records=
            []
          var $13=count
          while($13--){
            var $14={}
            $14.ratio=
              readUi8($bytes,$stream)
            if(tagCode>22){
              var $15=$14.color={}
              $15.red=
                readUi8($bytes,$stream)
              $15.green=
                readUi8($bytes,$stream)
              $15.blue=
                readUi8($bytes,$stream)
              $15.alpha=
                readUi8($bytes,$stream)
            }
            else{
              var $16=$14.color={}
              $16.red=
                readUi8($bytes,$stream)
              $16.green=
                readUi8($bytes,$stream)
              $16.blue=
                readUi8($bytes,$stream)
              $16.alpha=
                255
            }
            if(isMorph){

              $14.ratioMorph=
                readUi8($bytes,$stream)
              var $17=$14.colorMorph={}
              $17.red=
                readUi8($bytes,$stream)
              $17.green=
                readUi8($bytes,$stream)
              $17.blue=
                readUi8($bytes,$stream)
              $17.alpha=
                readUi8($bytes,$stream)
            }
            $12.push($14)}
          if(type===19){

            $6.focalPoint=
              readFixed8($bytes,$stream)
            if(isMorph){
              $6.focalPointMorph=
                readFixed8($bytes,$stream)
            }
          }
          break
        case 64:
        case 65:
        case 66:
        case 67:

          $6.bitmapId=
            readUi16($bytes,$stream)
          var $18=$6.matrix={}
          align($bytes,$stream)
          var hasScale=
            readUb($bytes,$stream,1)
          if(hasScale){

            var bits=
              readUb($bytes,$stream,5)
            $18.a=
              readFb($bytes,$stream,bits)
            $18.d=
              readFb($bytes,$stream,bits)
          }
          else{

            $18.a=
              1
            $18.d=
              1
          }
          var hasRotate=
            readUb($bytes,$stream,1)
          if(hasRotate){

            var bits=
              readUb($bytes,$stream,5)
            $18.b=
              readFb($bytes,$stream,bits)
            $18.c=
              readFb($bytes,$stream,bits)
          }
          else{

            $18.b=
              0
            $18.c=
              0
          }
          var bits=
            readUb($bytes,$stream,5)
          var e=
            readSb($bytes,$stream,bits)
          var f=
            readSb($bytes,$stream,bits)
          $18.tx=
            e/20
          $18.ty=
            f/20
          align($bytes,$stream)
          if(isMorph){
            var $19=$6.matrixMorph={}
            align($bytes,$stream)
            var hasScale=
              readUb($bytes,$stream,1)
            if(hasScale){

              var bits=
                readUb($bytes,$stream,5)
              $19.a=
                readFb($bytes,$stream,bits)
              $19.d=
                readFb($bytes,$stream,bits)
            }
            else{

              $19.a=
                1
              $19.d=
                1
            }
            var hasRotate=
              readUb($bytes,$stream,1)
            if(hasRotate){

              var bits=
                readUb($bytes,$stream,5)
              $19.b=
                readFb($bytes,$stream,bits)
              $19.c=
                readFb($bytes,$stream,bits)
            }
            else{

              $19.b=
                0
              $19.c=
                0
            }
            var bits=
              readUb($bytes,$stream,5)
            var e=
              readSb($bytes,$stream,bits)
            var f=
              readSb($bytes,$stream,bits)
            $19.tx=
              e/20
            $19.ty=
              f/20
            align($bytes,$stream)
          }
          $6.condition=
            type===64||type===67
          break
        default:
        }
        $4.push($6)}

      var tmp=
        readUi8($bytes,$stream)
      if(tagCode>2&&tmp===255){
        var count=
          readUi16($bytes,$stream)
      }
      else{
        var count=
          tmp
      }
      var $20=
        $.lineStyles=
        []
      var $21=count
      while($21--){
        var $22={}
        $22.width=
          readUi16($bytes,$stream)
        if(isMorph){
          $22.widthMorph=
            readUi16($bytes,$stream)
        }
        if(hasStrokes){

          align($bytes,$stream)
          $22.startCapStyle=
            readUb($bytes,$stream,2)
          var joinStyle=
            $22.joinStyle=
            readUb($bytes,$stream,2)
          var hasFill=
            $22.hasFill=
            readUb($bytes,$stream,1)
          $22.noHscale=
            readUb($bytes,$stream,1)
          $22.noVscale=
            readUb($bytes,$stream,1)
          $22.pixelHinting=
            readUb($bytes,$stream,1)
          var reserved=
            readUb($bytes,$stream,5)
          $22.noClose=
            readUb($bytes,$stream,1)
          $22.endCapStyle=
            readUb($bytes,$stream,2)
          if(joinStyle===2){
            $22.miterLimitFactor=
              readFixed8($bytes,$stream)
          }
          if(hasFill){

            var $23=$22.fillStyle={}
            var type=
              $23.type=
              readUi8($bytes,$stream)
            switch(type){
            case 0:

              if(tagCode>22||isMorph){
                var $24=$23.color={}
                $24.red=
                  readUi8($bytes,$stream)
                $24.green=
                  readUi8($bytes,$stream)
                $24.blue=
                  readUi8($bytes,$stream)
                $24.alpha=
                  readUi8($bytes,$stream)
              }
              else{
                var $25=$23.color={}
                $25.red=
                  readUi8($bytes,$stream)
                $25.green=
                  readUi8($bytes,$stream)
                $25.blue=
                  readUi8($bytes,$stream)
                $25.alpha=
                  255
              }
              if(isMorph){
                var $26=$23.colorMorph={}
                $26.red=
                  readUi8($bytes,$stream)
                $26.green=
                  readUi8($bytes,$stream)
                $26.blue=
                  readUi8($bytes,$stream)
                $26.alpha=
                  readUi8($bytes,$stream)
              }
              break
            case 16:
            case 18:
            case 19:

              var $27=$23.matrix={}
              align($bytes,$stream)
              var hasScale=
                readUb($bytes,$stream,1)
              if(hasScale){

                var bits=
                  readUb($bytes,$stream,5)
                $27.a=
                  readFb($bytes,$stream,bits)
                $27.d=
                  readFb($bytes,$stream,bits)
              }
              else{

                $27.a=
                  1
                $27.d=
                  1
              }
              var hasRotate=
                readUb($bytes,$stream,1)
              if(hasRotate){

                var bits=
                  readUb($bytes,$stream,5)
                $27.b=
                  readFb($bytes,$stream,bits)
                $27.c=
                  readFb($bytes,$stream,bits)
              }
              else{

                $27.b=
                  0
                $27.c=
                  0
              }
              var bits=
                readUb($bytes,$stream,5)
              var e=
                readSb($bytes,$stream,bits)
              var f=
                readSb($bytes,$stream,bits)
              $27.tx=
                e/20
              $27.ty=
                f/20
              align($bytes,$stream)
              if(isMorph){
                var $28=$23.matrixMorph={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $28.a=
                    readFb($bytes,$stream,bits)
                  $28.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $28.a=
                    1
                  $28.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $28.b=
                    readFb($bytes,$stream,bits)
                  $28.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $28.b=
                    0
                  $28.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $28.tx=
                  e/20
                $28.ty=
                  f/20
                align($bytes,$stream)
              }

              if(tagCode===83){

                $23.spreadMode=
                  readUb($bytes,$stream,2)
                $23.interpolationMode=
                  readUb($bytes,$stream,2)
              }
              else{

                var pad=
                  readUb($bytes,$stream,4)
              }
              var count=
                $23.count=
                readUb($bytes,$stream,4)
              var $29=
                $23.records=
                []
              var $30=count
              while($30--){
                var $31={}
                $31.ratio=
                  readUi8($bytes,$stream)
                if(tagCode>22){
                  var $32=$31.color={}
                  $32.red=
                    readUi8($bytes,$stream)
                  $32.green=
                    readUi8($bytes,$stream)
                  $32.blue=
                    readUi8($bytes,$stream)
                  $32.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $33=$31.color={}
                  $33.red=
                    readUi8($bytes,$stream)
                  $33.green=
                    readUi8($bytes,$stream)
                  $33.blue=
                    readUi8($bytes,$stream)
                  $33.alpha=
                    255
                }
                if(isMorph){

                  $31.ratioMorph=
                    readUi8($bytes,$stream)
                  var $34=$31.colorMorph={}
                  $34.red=
                    readUi8($bytes,$stream)
                  $34.green=
                    readUi8($bytes,$stream)
                  $34.blue=
                    readUi8($bytes,$stream)
                  $34.alpha=
                    readUi8($bytes,$stream)
                }
                $29.push($31)}
              if(type===19){

                $23.focalPoint=
                  readFixed8($bytes,$stream)
                if(isMorph){
                  $23.focalPointMorph=
                    readFixed8($bytes,$stream)
                }
              }
              break
            case 64:
            case 65:
            case 66:
            case 67:

              $23.bitmapId=
                readUi16($bytes,$stream)
              var $35=$23.matrix={}
              align($bytes,$stream)
              var hasScale=
                readUb($bytes,$stream,1)
              if(hasScale){

                var bits=
                  readUb($bytes,$stream,5)
                $35.a=
                  readFb($bytes,$stream,bits)
                $35.d=
                  readFb($bytes,$stream,bits)
              }
              else{

                $35.a=
                  1
                $35.d=
                  1
              }
              var hasRotate=
                readUb($bytes,$stream,1)
              if(hasRotate){

                var bits=
                  readUb($bytes,$stream,5)
                $35.b=
                  readFb($bytes,$stream,bits)
                $35.c=
                  readFb($bytes,$stream,bits)
              }
              else{

                $35.b=
                  0
                $35.c=
                  0
              }
              var bits=
                readUb($bytes,$stream,5)
              var e=
                readSb($bytes,$stream,bits)
              var f=
                readSb($bytes,$stream,bits)
              $35.tx=
                e/20
              $35.ty=
                f/20
              align($bytes,$stream)
              if(isMorph){
                var $36=$23.matrixMorph={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $36.a=
                    readFb($bytes,$stream,bits)
                  $36.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $36.a=
                    1
                  $36.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $36.b=
                    readFb($bytes,$stream,bits)
                  $36.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $36.b=
                    0
                  $36.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $36.tx=
                  e/20
                $36.ty=
                  f/20
                align($bytes,$stream)
              }
              $23.condition=
                type===64||type===67
              break
            default:
            }
          }
          else{

            var $37=$22.color={}
            $37.red=
              readUi8($bytes,$stream)
            $37.green=
              readUi8($bytes,$stream)
            $37.blue=
              readUi8($bytes,$stream)
            $37.alpha=
              readUi8($bytes,$stream)
            if(isMorph){
              var $38=$22.colorMorph={}
              $38.red=
                readUi8($bytes,$stream)
              $38.green=
                readUi8($bytes,$stream)
              $38.blue=
                readUi8($bytes,$stream)
              $38.alpha=
                readUi8($bytes,$stream)
            }
          }
        }
        else{

          if(tagCode>22){
            var $39=$22.color={}
            $39.red=
              readUi8($bytes,$stream)
            $39.green=
              readUi8($bytes,$stream)
            $39.blue=
              readUi8($bytes,$stream)
            $39.alpha=
              readUi8($bytes,$stream)
          }
          else{
            var $40=$22.color={}
            $40.red=
              readUi8($bytes,$stream)
            $40.green=
              readUi8($bytes,$stream)
            $40.blue=
              readUi8($bytes,$stream)
            $40.alpha=
              255
          }
          if(isMorph){
            var $41=$22.colorMorph={}
            $41.red=
              readUi8($bytes,$stream)
            $41.green=
              readUi8($bytes,$stream)
            $41.blue=
              readUi8($bytes,$stream)
            $41.alpha=
              readUi8($bytes,$stream)
          }
        }
        $20.push($22)}

      align($bytes,$stream)
      var fillBits=
        readUb($bytes,$stream,4)
      var lineBits=
        readUb($bytes,$stream,4)
      var $42=
        $.records=
        []
      do{
        var $43={}
        var type=
          $43.type=
          readUb($bytes,$stream,1)
        var flags=
          readUb($bytes,$stream,5)
        var eos=
          $43.eos=
          !(type||flags)
        if(type){

          var isStraight=
            $43.isStraight=
            flags>>4
          var tmp=
            flags&0x0f
          var bits=
            tmp+2
          if(isStraight){

            var isGeneral=
              $43.isGeneral=
              readUb($bytes,$stream,1)
            if(isGeneral){

              $43.deltaX=
                readSb($bytes,$stream,bits)
              $43.deltaY=
                readSb($bytes,$stream,bits)
            }
            else{

              var isVertical=
                $43.isVertical=
                readUb($bytes,$stream,1)
              if(isVertical){

                $43.deltaY=
                  readSb($bytes,$stream,bits)
              }
              else{

                $43.deltaX=
                  readSb($bytes,$stream,bits)
              }
            }
          }
          else{

            $43.controlDeltaX=
              readSb($bytes,$stream,bits)
            $43.controlDeltaY=
              readSb($bytes,$stream,bits)
            $43.anchorDeltaX=
              readSb($bytes,$stream,bits)
            $43.anchorDeltaY=
              readSb($bytes,$stream,bits)
          }
        }
        else{

          if(tagCode>2){
            var hasNewStyles=$43.hasNewStyles=
              flags>>4
          }
          else{
            var hasNewStyles=$43.hasNewStyles=
              0
          }
          var hasLineStyle=
            $43.hasLineStyle=
            flags>>3&1
          var hasFillStyle1=
            $43.hasFillStyle1=
            flags>>2&1
          var hasFillStyle0=
            $43.hasFillStyle0=
            flags>>1&1
          var move=
            $43.move=
            flags&1
          if(move){

            var bits=
              readUb($bytes,$stream,5)
            $43.moveX=
              readSb($bytes,$stream,bits)
            $43.moveY=
              readSb($bytes,$stream,bits)
          }
          if(hasFillStyle0){
            $43.fillStyle0=
              readUb($bytes,$stream,fillBits)
          }
          if(hasFillStyle1){
            $43.fillStyle1=
              readUb($bytes,$stream,fillBits)
          }
          if(hasLineStyle){
            $43.lineStyle=
              readUb($bytes,$stream,lineBits)
          }
          if(hasNewStyles){


            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $44=
              $43.fillStyles=
              []
            var $45=count
            while($45--){
              var $46={}
              var type=
                $46.type=
                readUi8($bytes,$stream)
              switch(type){
              case 0:

                if(tagCode>22||isMorph){
                  var $47=$46.color={}
                  $47.red=
                    readUi8($bytes,$stream)
                  $47.green=
                    readUi8($bytes,$stream)
                  $47.blue=
                    readUi8($bytes,$stream)
                  $47.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $48=$46.color={}
                  $48.red=
                    readUi8($bytes,$stream)
                  $48.green=
                    readUi8($bytes,$stream)
                  $48.blue=
                    readUi8($bytes,$stream)
                  $48.alpha=
                    255
                }
                if(isMorph){
                  var $49=$46.colorMorph={}
                  $49.red=
                    readUi8($bytes,$stream)
                  $49.green=
                    readUi8($bytes,$stream)
                  $49.blue=
                    readUi8($bytes,$stream)
                  $49.alpha=
                    readUi8($bytes,$stream)
                }
                break
              case 16:
              case 18:
              case 19:

                var $50=$46.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $50.a=
                    readFb($bytes,$stream,bits)
                  $50.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $50.a=
                    1
                  $50.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $50.b=
                    readFb($bytes,$stream,bits)
                  $50.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $50.b=
                    0
                  $50.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $50.tx=
                  e/20
                $50.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $51=$46.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $51.a=
                      readFb($bytes,$stream,bits)
                    $51.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $51.a=
                      1
                    $51.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $51.b=
                      readFb($bytes,$stream,bits)
                    $51.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $51.b=
                      0
                    $51.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $51.tx=
                    e/20
                  $51.ty=
                    f/20
                  align($bytes,$stream)
                }

                if(tagCode===83){

                  $46.spreadMode=
                    readUb($bytes,$stream,2)
                  $46.interpolationMode=
                    readUb($bytes,$stream,2)
                }
                else{

                  var pad=
                    readUb($bytes,$stream,4)
                }
                var count=
                  $46.count=
                  readUb($bytes,$stream,4)
                var $52=
                  $46.records=
                  []
                var $53=count
                while($53--){
                  var $54={}
                  $54.ratio=
                    readUi8($bytes,$stream)
                  if(tagCode>22){
                    var $55=$54.color={}
                    $55.red=
                      readUi8($bytes,$stream)
                    $55.green=
                      readUi8($bytes,$stream)
                    $55.blue=
                      readUi8($bytes,$stream)
                    $55.alpha=
                      readUi8($bytes,$stream)
                  }
                  else{
                    var $56=$54.color={}
                    $56.red=
                      readUi8($bytes,$stream)
                    $56.green=
                      readUi8($bytes,$stream)
                    $56.blue=
                      readUi8($bytes,$stream)
                    $56.alpha=
                      255
                  }
                  if(isMorph){

                    $54.ratioMorph=
                      readUi8($bytes,$stream)
                    var $57=$54.colorMorph={}
                    $57.red=
                      readUi8($bytes,$stream)
                    $57.green=
                      readUi8($bytes,$stream)
                    $57.blue=
                      readUi8($bytes,$stream)
                    $57.alpha=
                      readUi8($bytes,$stream)
                  }
                  $52.push($54)}
                if(type===19){

                  $46.focalPoint=
                    readFixed8($bytes,$stream)
                  if(isMorph){
                    $46.focalPointMorph=
                      readFixed8($bytes,$stream)
                  }
                }
                break
              case 64:
              case 65:
              case 66:
              case 67:

                $46.bitmapId=
                  readUi16($bytes,$stream)
                var $58=$46.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $58.a=
                    readFb($bytes,$stream,bits)
                  $58.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $58.a=
                    1
                  $58.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $58.b=
                    readFb($bytes,$stream,bits)
                  $58.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $58.b=
                    0
                  $58.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $58.tx=
                  e/20
                $58.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $59=$46.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $59.a=
                      readFb($bytes,$stream,bits)
                    $59.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $59.a=
                      1
                    $59.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $59.b=
                      readFb($bytes,$stream,bits)
                    $59.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $59.b=
                      0
                    $59.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $59.tx=
                    e/20
                  $59.ty=
                    f/20
                  align($bytes,$stream)
                }
                $46.condition=
                  type===64||type===67
                break
              default:
              }
              $44.push($46)}

            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $60=
              $43.lineStyles=
              []
            var $61=count
            while($61--){
              var $62={}
              $62.width=
                readUi16($bytes,$stream)
              if(isMorph){
                $62.widthMorph=
                  readUi16($bytes,$stream)
              }
              if(hasStrokes){

                align($bytes,$stream)
                $62.startCapStyle=
                  readUb($bytes,$stream,2)
                var joinStyle=
                  $62.joinStyle=
                  readUb($bytes,$stream,2)
                var hasFill=
                  $62.hasFill=
                  readUb($bytes,$stream,1)
                $62.noHscale=
                  readUb($bytes,$stream,1)
                $62.noVscale=
                  readUb($bytes,$stream,1)
                $62.pixelHinting=
                  readUb($bytes,$stream,1)
                var reserved=
                  readUb($bytes,$stream,5)
                $62.noClose=
                  readUb($bytes,$stream,1)
                $62.endCapStyle=
                  readUb($bytes,$stream,2)
                if(joinStyle===2){
                  $62.miterLimitFactor=
                    readFixed8($bytes,$stream)
                }
                if(hasFill){

                  var $63=$62.fillStyle={}
                  var type=
                    $63.type=
                    readUi8($bytes,$stream)
                  switch(type){
                  case 0:

                    if(tagCode>22||isMorph){
                      var $64=$63.color={}
                      $64.red=
                        readUi8($bytes,$stream)
                      $64.green=
                        readUi8($bytes,$stream)
                      $64.blue=
                        readUi8($bytes,$stream)
                      $64.alpha=
                        readUi8($bytes,$stream)
                    }
                    else{
                      var $65=$63.color={}
                      $65.red=
                        readUi8($bytes,$stream)
                      $65.green=
                        readUi8($bytes,$stream)
                      $65.blue=
                        readUi8($bytes,$stream)
                      $65.alpha=
                        255
                    }
                    if(isMorph){
                      var $66=$63.colorMorph={}
                      $66.red=
                        readUi8($bytes,$stream)
                      $66.green=
                        readUi8($bytes,$stream)
                      $66.blue=
                        readUi8($bytes,$stream)
                      $66.alpha=
                        readUi8($bytes,$stream)
                    }
                    break
                  case 16:
                  case 18:
                  case 19:

                    var $67=$63.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $67.a=
                        readFb($bytes,$stream,bits)
                      $67.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $67.a=
                        1
                      $67.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $67.b=
                        readFb($bytes,$stream,bits)
                      $67.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $67.b=
                        0
                      $67.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $67.tx=
                      e/20
                    $67.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $68=$63.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $68.a=
                          readFb($bytes,$stream,bits)
                        $68.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $68.a=
                          1
                        $68.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $68.b=
                          readFb($bytes,$stream,bits)
                        $68.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $68.b=
                          0
                        $68.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $68.tx=
                        e/20
                      $68.ty=
                        f/20
                      align($bytes,$stream)
                    }

                    if(tagCode===83){

                      $63.spreadMode=
                        readUb($bytes,$stream,2)
                      $63.interpolationMode=
                        readUb($bytes,$stream,2)
                    }
                    else{

                      var pad=
                        readUb($bytes,$stream,4)
                    }
                    var count=
                      $63.count=
                      readUb($bytes,$stream,4)
                    var $69=
                      $63.records=
                      []
                    var $70=count
                    while($70--){
                      var $71={}
                      $71.ratio=
                        readUi8($bytes,$stream)
                      if(tagCode>22){
                        var $72=$71.color={}
                        $72.red=
                          readUi8($bytes,$stream)
                        $72.green=
                          readUi8($bytes,$stream)
                        $72.blue=
                          readUi8($bytes,$stream)
                        $72.alpha=
                          readUi8($bytes,$stream)
                      }
                      else{
                        var $73=$71.color={}
                        $73.red=
                          readUi8($bytes,$stream)
                        $73.green=
                          readUi8($bytes,$stream)
                        $73.blue=
                          readUi8($bytes,$stream)
                        $73.alpha=
                          255
                      }
                      if(isMorph){

                        $71.ratioMorph=
                          readUi8($bytes,$stream)
                        var $74=$71.colorMorph={}
                        $74.red=
                          readUi8($bytes,$stream)
                        $74.green=
                          readUi8($bytes,$stream)
                        $74.blue=
                          readUi8($bytes,$stream)
                        $74.alpha=
                          readUi8($bytes,$stream)
                      }
                      $69.push($71)}
                    if(type===19){

                      $63.focalPoint=
                        readFixed8($bytes,$stream)
                      if(isMorph){
                        $63.focalPointMorph=
                          readFixed8($bytes,$stream)
                      }
                    }
                    break
                  case 64:
                  case 65:
                  case 66:
                  case 67:

                    $63.bitmapId=
                      readUi16($bytes,$stream)
                    var $75=$63.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $75.a=
                        readFb($bytes,$stream,bits)
                      $75.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $75.a=
                        1
                      $75.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $75.b=
                        readFb($bytes,$stream,bits)
                      $75.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $75.b=
                        0
                      $75.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $75.tx=
                      e/20
                    $75.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $76=$63.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $76.a=
                          readFb($bytes,$stream,bits)
                        $76.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $76.a=
                          1
                        $76.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $76.b=
                          readFb($bytes,$stream,bits)
                        $76.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $76.b=
                          0
                        $76.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $76.tx=
                        e/20
                      $76.ty=
                        f/20
                      align($bytes,$stream)
                    }
                    $63.condition=
                      type===64||type===67
                    break
                  default:
                  }
                }
                else{

                  var $77=$62.color={}
                  $77.red=
                    readUi8($bytes,$stream)
                  $77.green=
                    readUi8($bytes,$stream)
                  $77.blue=
                    readUi8($bytes,$stream)
                  $77.alpha=
                    readUi8($bytes,$stream)
                  if(isMorph){
                    var $78=$62.colorMorph={}
                    $78.red=
                      readUi8($bytes,$stream)
                    $78.green=
                      readUi8($bytes,$stream)
                    $78.blue=
                      readUi8($bytes,$stream)
                    $78.alpha=
                      readUi8($bytes,$stream)
                  }
                }
              }
              else{

                if(tagCode>22){
                  var $79=$62.color={}
                  $79.red=
                    readUi8($bytes,$stream)
                  $79.green=
                    readUi8($bytes,$stream)
                  $79.blue=
                    readUi8($bytes,$stream)
                  $79.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $80=$62.color={}
                  $80.red=
                    readUi8($bytes,$stream)
                  $80.green=
                    readUi8($bytes,$stream)
                  $80.blue=
                    readUi8($bytes,$stream)
                  $80.alpha=
                    255
                }
                if(isMorph){
                  var $81=$62.colorMorph={}
                  $81.red=
                    readUi8($bytes,$stream)
                  $81.green=
                    readUi8($bytes,$stream)
                  $81.blue=
                    readUi8($bytes,$stream)
                  $81.alpha=
                    readUi8($bytes,$stream)
                }
              }
              $60.push($62)}

            align($bytes,$stream)
            var fillBits=
              readUb($bytes,$stream,4)
            var lineBits=
              readUb($bytes,$stream,4)
          }
        }
        $42.push($43)}
      while(!eos)

      align($bytes,$stream)
      var fillBits=
        readUb($bytes,$stream,4)
      var lineBits=
        readUb($bytes,$stream,4)
      var $82=
        $.recordsMorph=
        []
      do{
        var $83={}
        var type=
          $83.type=
          readUb($bytes,$stream,1)
        var flags=
          readUb($bytes,$stream,5)
        var eos=
          $83.eos=
          !(type||flags)
        if(type){

          var isStraight=
            $83.isStraight=
            flags>>4
          var tmp=
            flags&0x0f
          var bits=
            tmp+2
          if(isStraight){

            var isGeneral=
              $83.isGeneral=
              readUb($bytes,$stream,1)
            if(isGeneral){

              $83.deltaX=
                readSb($bytes,$stream,bits)
              $83.deltaY=
                readSb($bytes,$stream,bits)
            }
            else{

              var isVertical=
                $83.isVertical=
                readUb($bytes,$stream,1)
              if(isVertical){

                $83.deltaY=
                  readSb($bytes,$stream,bits)
              }
              else{

                $83.deltaX=
                  readSb($bytes,$stream,bits)
              }
            }
          }
          else{

            $83.controlDeltaX=
              readSb($bytes,$stream,bits)
            $83.controlDeltaY=
              readSb($bytes,$stream,bits)
            $83.anchorDeltaX=
              readSb($bytes,$stream,bits)
            $83.anchorDeltaY=
              readSb($bytes,$stream,bits)
          }
        }
        else{

          if(tagCode>2){
            var hasNewStyles=$83.hasNewStyles=
              flags>>4
          }
          else{
            var hasNewStyles=$83.hasNewStyles=
              0
          }
          var hasLineStyle=
            $83.hasLineStyle=
            flags>>3&1
          var hasFillStyle1=
            $83.hasFillStyle1=
            flags>>2&1
          var hasFillStyle0=
            $83.hasFillStyle0=
            flags>>1&1
          var move=
            $83.move=
            flags&1
          if(move){

            var bits=
              readUb($bytes,$stream,5)
            $83.moveX=
              readSb($bytes,$stream,bits)
            $83.moveY=
              readSb($bytes,$stream,bits)
          }
          if(hasFillStyle0){
            $83.fillStyle0=
              readUb($bytes,$stream,fillBits)
          }
          if(hasFillStyle1){
            $83.fillStyle1=
              readUb($bytes,$stream,fillBits)
          }
          if(hasLineStyle){
            $83.lineStyle=
              readUb($bytes,$stream,lineBits)
          }
          if(hasNewStyles){


            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $84=
              $83.fillStyles=
              []
            var $85=count
            while($85--){
              var $86={}
              var type=
                $86.type=
                readUi8($bytes,$stream)
              switch(type){
              case 0:

                if(tagCode>22||isMorph){
                  var $87=$86.color={}
                  $87.red=
                    readUi8($bytes,$stream)
                  $87.green=
                    readUi8($bytes,$stream)
                  $87.blue=
                    readUi8($bytes,$stream)
                  $87.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $88=$86.color={}
                  $88.red=
                    readUi8($bytes,$stream)
                  $88.green=
                    readUi8($bytes,$stream)
                  $88.blue=
                    readUi8($bytes,$stream)
                  $88.alpha=
                    255
                }
                if(isMorph){
                  var $89=$86.colorMorph={}
                  $89.red=
                    readUi8($bytes,$stream)
                  $89.green=
                    readUi8($bytes,$stream)
                  $89.blue=
                    readUi8($bytes,$stream)
                  $89.alpha=
                    readUi8($bytes,$stream)
                }
                break
              case 16:
              case 18:
              case 19:

                var $90=$86.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $90.a=
                    readFb($bytes,$stream,bits)
                  $90.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $90.a=
                    1
                  $90.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $90.b=
                    readFb($bytes,$stream,bits)
                  $90.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $90.b=
                    0
                  $90.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $90.tx=
                  e/20
                $90.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $91=$86.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $91.a=
                      readFb($bytes,$stream,bits)
                    $91.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $91.a=
                      1
                    $91.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $91.b=
                      readFb($bytes,$stream,bits)
                    $91.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $91.b=
                      0
                    $91.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $91.tx=
                    e/20
                  $91.ty=
                    f/20
                  align($bytes,$stream)
                }

                if(tagCode===83){

                  $86.spreadMode=
                    readUb($bytes,$stream,2)
                  $86.interpolationMode=
                    readUb($bytes,$stream,2)
                }
                else{

                  var pad=
                    readUb($bytes,$stream,4)
                }
                var count=
                  $86.count=
                  readUb($bytes,$stream,4)
                var $92=
                  $86.records=
                  []
                var $93=count
                while($93--){
                  var $94={}
                  $94.ratio=
                    readUi8($bytes,$stream)
                  if(tagCode>22){
                    var $95=$94.color={}
                    $95.red=
                      readUi8($bytes,$stream)
                    $95.green=
                      readUi8($bytes,$stream)
                    $95.blue=
                      readUi8($bytes,$stream)
                    $95.alpha=
                      readUi8($bytes,$stream)
                  }
                  else{
                    var $96=$94.color={}
                    $96.red=
                      readUi8($bytes,$stream)
                    $96.green=
                      readUi8($bytes,$stream)
                    $96.blue=
                      readUi8($bytes,$stream)
                    $96.alpha=
                      255
                  }
                  if(isMorph){

                    $94.ratioMorph=
                      readUi8($bytes,$stream)
                    var $97=$94.colorMorph={}
                    $97.red=
                      readUi8($bytes,$stream)
                    $97.green=
                      readUi8($bytes,$stream)
                    $97.blue=
                      readUi8($bytes,$stream)
                    $97.alpha=
                      readUi8($bytes,$stream)
                  }
                  $92.push($94)}
                if(type===19){

                  $86.focalPoint=
                    readFixed8($bytes,$stream)
                  if(isMorph){
                    $86.focalPointMorph=
                      readFixed8($bytes,$stream)
                  }
                }
                break
              case 64:
              case 65:
              case 66:
              case 67:

                $86.bitmapId=
                  readUi16($bytes,$stream)
                var $98=$86.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $98.a=
                    readFb($bytes,$stream,bits)
                  $98.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $98.a=
                    1
                  $98.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $98.b=
                    readFb($bytes,$stream,bits)
                  $98.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $98.b=
                    0
                  $98.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $98.tx=
                  e/20
                $98.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $99=$86.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $99.a=
                      readFb($bytes,$stream,bits)
                    $99.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $99.a=
                      1
                    $99.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $99.b=
                      readFb($bytes,$stream,bits)
                    $99.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $99.b=
                      0
                    $99.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $99.tx=
                    e/20
                  $99.ty=
                    f/20
                  align($bytes,$stream)
                }
                $86.condition=
                  type===64||type===67
                break
              default:
              }
              $84.push($86)}

            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $100=
              $83.lineStyles=
              []
            var $101=count
            while($101--){
              var $102={}
              $102.width=
                readUi16($bytes,$stream)
              if(isMorph){
                $102.widthMorph=
                  readUi16($bytes,$stream)
              }
              if(hasStrokes){

                align($bytes,$stream)
                $102.startCapStyle=
                  readUb($bytes,$stream,2)
                var joinStyle=
                  $102.joinStyle=
                  readUb($bytes,$stream,2)
                var hasFill=
                  $102.hasFill=
                  readUb($bytes,$stream,1)
                $102.noHscale=
                  readUb($bytes,$stream,1)
                $102.noVscale=
                  readUb($bytes,$stream,1)
                $102.pixelHinting=
                  readUb($bytes,$stream,1)
                var reserved=
                  readUb($bytes,$stream,5)
                $102.noClose=
                  readUb($bytes,$stream,1)
                $102.endCapStyle=
                  readUb($bytes,$stream,2)
                if(joinStyle===2){
                  $102.miterLimitFactor=
                    readFixed8($bytes,$stream)
                }
                if(hasFill){

                  var $103=$102.fillStyle={}
                  var type=
                    $103.type=
                    readUi8($bytes,$stream)
                  switch(type){
                  case 0:

                    if(tagCode>22||isMorph){
                      var $104=$103.color={}
                      $104.red=
                        readUi8($bytes,$stream)
                      $104.green=
                        readUi8($bytes,$stream)
                      $104.blue=
                        readUi8($bytes,$stream)
                      $104.alpha=
                        readUi8($bytes,$stream)
                    }
                    else{
                      var $105=$103.color={}
                      $105.red=
                        readUi8($bytes,$stream)
                      $105.green=
                        readUi8($bytes,$stream)
                      $105.blue=
                        readUi8($bytes,$stream)
                      $105.alpha=
                        255
                    }
                    if(isMorph){
                      var $106=$103.colorMorph={}
                      $106.red=
                        readUi8($bytes,$stream)
                      $106.green=
                        readUi8($bytes,$stream)
                      $106.blue=
                        readUi8($bytes,$stream)
                      $106.alpha=
                        readUi8($bytes,$stream)
                    }
                    break
                  case 16:
                  case 18:
                  case 19:

                    var $107=$103.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $107.a=
                        readFb($bytes,$stream,bits)
                      $107.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $107.a=
                        1
                      $107.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $107.b=
                        readFb($bytes,$stream,bits)
                      $107.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $107.b=
                        0
                      $107.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $107.tx=
                      e/20
                    $107.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $108=$103.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $108.a=
                          readFb($bytes,$stream,bits)
                        $108.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $108.a=
                          1
                        $108.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $108.b=
                          readFb($bytes,$stream,bits)
                        $108.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $108.b=
                          0
                        $108.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $108.tx=
                        e/20
                      $108.ty=
                        f/20
                      align($bytes,$stream)
                    }

                    if(tagCode===83){

                      $103.spreadMode=
                        readUb($bytes,$stream,2)
                      $103.interpolationMode=
                        readUb($bytes,$stream,2)
                    }
                    else{

                      var pad=
                        readUb($bytes,$stream,4)
                    }
                    var count=
                      $103.count=
                      readUb($bytes,$stream,4)
                    var $109=
                      $103.records=
                      []
                    var $110=count
                    while($110--){
                      var $111={}
                      $111.ratio=
                        readUi8($bytes,$stream)
                      if(tagCode>22){
                        var $112=$111.color={}
                        $112.red=
                          readUi8($bytes,$stream)
                        $112.green=
                          readUi8($bytes,$stream)
                        $112.blue=
                          readUi8($bytes,$stream)
                        $112.alpha=
                          readUi8($bytes,$stream)
                      }
                      else{
                        var $113=$111.color={}
                        $113.red=
                          readUi8($bytes,$stream)
                        $113.green=
                          readUi8($bytes,$stream)
                        $113.blue=
                          readUi8($bytes,$stream)
                        $113.alpha=
                          255
                      }
                      if(isMorph){

                        $111.ratioMorph=
                          readUi8($bytes,$stream)
                        var $114=$111.colorMorph={}
                        $114.red=
                          readUi8($bytes,$stream)
                        $114.green=
                          readUi8($bytes,$stream)
                        $114.blue=
                          readUi8($bytes,$stream)
                        $114.alpha=
                          readUi8($bytes,$stream)
                      }
                      $109.push($111)}
                    if(type===19){

                      $103.focalPoint=
                        readFixed8($bytes,$stream)
                      if(isMorph){
                        $103.focalPointMorph=
                          readFixed8($bytes,$stream)
                      }
                    }
                    break
                  case 64:
                  case 65:
                  case 66:
                  case 67:

                    $103.bitmapId=
                      readUi16($bytes,$stream)
                    var $115=$103.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $115.a=
                        readFb($bytes,$stream,bits)
                      $115.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $115.a=
                        1
                      $115.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $115.b=
                        readFb($bytes,$stream,bits)
                      $115.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $115.b=
                        0
                      $115.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $115.tx=
                      e/20
                    $115.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $116=$103.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $116.a=
                          readFb($bytes,$stream,bits)
                        $116.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $116.a=
                          1
                        $116.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $116.b=
                          readFb($bytes,$stream,bits)
                        $116.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $116.b=
                          0
                        $116.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $116.tx=
                        e/20
                      $116.ty=
                        f/20
                      align($bytes,$stream)
                    }
                    $103.condition=
                      type===64||type===67
                    break
                  default:
                  }
                }
                else{

                  var $117=$102.color={}
                  $117.red=
                    readUi8($bytes,$stream)
                  $117.green=
                    readUi8($bytes,$stream)
                  $117.blue=
                    readUi8($bytes,$stream)
                  $117.alpha=
                    readUi8($bytes,$stream)
                  if(isMorph){
                    var $118=$102.colorMorph={}
                    $118.red=
                      readUi8($bytes,$stream)
                    $118.green=
                      readUi8($bytes,$stream)
                    $118.blue=
                      readUi8($bytes,$stream)
                    $118.alpha=
                      readUi8($bytes,$stream)
                  }
                }
              }
              else{

                if(tagCode>22){
                  var $119=$102.color={}
                  $119.red=
                    readUi8($bytes,$stream)
                  $119.green=
                    readUi8($bytes,$stream)
                  $119.blue=
                    readUi8($bytes,$stream)
                  $119.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $120=$102.color={}
                  $120.red=
                    readUi8($bytes,$stream)
                  $120.green=
                    readUi8($bytes,$stream)
                  $120.blue=
                    readUi8($bytes,$stream)
                  $120.alpha=
                    255
                }
                if(isMorph){
                  var $121=$102.colorMorph={}
                  $121.red=
                    readUi8($bytes,$stream)
                  $121.green=
                    readUi8($bytes,$stream)
                  $121.blue=
                    readUi8($bytes,$stream)
                  $121.alpha=
                    readUi8($bytes,$stream)
                }
              }
              $100.push($102)}

            align($bytes,$stream)
            var fillBits=
              readUb($bytes,$stream,4)
            var lineBits=
              readUb($bytes,$stream,4)
          }
        }
        $82.push($83)}
      while(!eos)
    }
    else{




      var tmp=
        readUi8($bytes,$stream)
      if(tagCode>2&&tmp===255){
        var count=
          readUi16($bytes,$stream)
      }
      else{
        var count=
          tmp
      }
      var $122=
        $.fillStyles=
        []
      var $123=count
      while($123--){
        var $124={}
        var type=
          $124.type=
          readUi8($bytes,$stream)
        switch(type){
        case 0:

          if(tagCode>22||isMorph){
            var $125=$124.color={}
            $125.red=
              readUi8($bytes,$stream)
            $125.green=
              readUi8($bytes,$stream)
            $125.blue=
              readUi8($bytes,$stream)
            $125.alpha=
              readUi8($bytes,$stream)
          }
          else{
            var $126=$124.color={}
            $126.red=
              readUi8($bytes,$stream)
            $126.green=
              readUi8($bytes,$stream)
            $126.blue=
              readUi8($bytes,$stream)
            $126.alpha=
              255
          }
          if(isMorph){
            var $127=$124.colorMorph={}
            $127.red=
              readUi8($bytes,$stream)
            $127.green=
              readUi8($bytes,$stream)
            $127.blue=
              readUi8($bytes,$stream)
            $127.alpha=
              readUi8($bytes,$stream)
          }
          break
        case 16:
        case 18:
        case 19:

          var $128=$124.matrix={}
          align($bytes,$stream)
          var hasScale=
            readUb($bytes,$stream,1)
          if(hasScale){

            var bits=
              readUb($bytes,$stream,5)
            $128.a=
              readFb($bytes,$stream,bits)
            $128.d=
              readFb($bytes,$stream,bits)
          }
          else{

            $128.a=
              1
            $128.d=
              1
          }
          var hasRotate=
            readUb($bytes,$stream,1)
          if(hasRotate){

            var bits=
              readUb($bytes,$stream,5)
            $128.b=
              readFb($bytes,$stream,bits)
            $128.c=
              readFb($bytes,$stream,bits)
          }
          else{

            $128.b=
              0
            $128.c=
              0
          }
          var bits=
            readUb($bytes,$stream,5)
          var e=
            readSb($bytes,$stream,bits)
          var f=
            readSb($bytes,$stream,bits)
          $128.tx=
            e/20
          $128.ty=
            f/20
          align($bytes,$stream)
          if(isMorph){
            var $129=$124.matrixMorph={}
            align($bytes,$stream)
            var hasScale=
              readUb($bytes,$stream,1)
            if(hasScale){

              var bits=
                readUb($bytes,$stream,5)
              $129.a=
                readFb($bytes,$stream,bits)
              $129.d=
                readFb($bytes,$stream,bits)
            }
            else{

              $129.a=
                1
              $129.d=
                1
            }
            var hasRotate=
              readUb($bytes,$stream,1)
            if(hasRotate){

              var bits=
                readUb($bytes,$stream,5)
              $129.b=
                readFb($bytes,$stream,bits)
              $129.c=
                readFb($bytes,$stream,bits)
            }
            else{

              $129.b=
                0
              $129.c=
                0
            }
            var bits=
              readUb($bytes,$stream,5)
            var e=
              readSb($bytes,$stream,bits)
            var f=
              readSb($bytes,$stream,bits)
            $129.tx=
              e/20
            $129.ty=
              f/20
            align($bytes,$stream)
          }

          if(tagCode===83){

            $124.spreadMode=
              readUb($bytes,$stream,2)
            $124.interpolationMode=
              readUb($bytes,$stream,2)
          }
          else{

            var pad=
              readUb($bytes,$stream,4)
          }
          var count=
            $124.count=
            readUb($bytes,$stream,4)
          var $130=
            $124.records=
            []
          var $131=count
          while($131--){
            var $132={}
            $132.ratio=
              readUi8($bytes,$stream)
            if(tagCode>22){
              var $133=$132.color={}
              $133.red=
                readUi8($bytes,$stream)
              $133.green=
                readUi8($bytes,$stream)
              $133.blue=
                readUi8($bytes,$stream)
              $133.alpha=
                readUi8($bytes,$stream)
            }
            else{
              var $134=$132.color={}
              $134.red=
                readUi8($bytes,$stream)
              $134.green=
                readUi8($bytes,$stream)
              $134.blue=
                readUi8($bytes,$stream)
              $134.alpha=
                255
            }
            if(isMorph){

              $132.ratioMorph=
                readUi8($bytes,$stream)
              var $135=$132.colorMorph={}
              $135.red=
                readUi8($bytes,$stream)
              $135.green=
                readUi8($bytes,$stream)
              $135.blue=
                readUi8($bytes,$stream)
              $135.alpha=
                readUi8($bytes,$stream)
            }
            $130.push($132)}
          if(type===19){

            $124.focalPoint=
              readFixed8($bytes,$stream)
            if(isMorph){
              $124.focalPointMorph=
                readFixed8($bytes,$stream)
            }
          }
          break
        case 64:
        case 65:
        case 66:
        case 67:

          $124.bitmapId=
            readUi16($bytes,$stream)
          var $136=$124.matrix={}
          align($bytes,$stream)
          var hasScale=
            readUb($bytes,$stream,1)
          if(hasScale){

            var bits=
              readUb($bytes,$stream,5)
            $136.a=
              readFb($bytes,$stream,bits)
            $136.d=
              readFb($bytes,$stream,bits)
          }
          else{

            $136.a=
              1
            $136.d=
              1
          }
          var hasRotate=
            readUb($bytes,$stream,1)
          if(hasRotate){

            var bits=
              readUb($bytes,$stream,5)
            $136.b=
              readFb($bytes,$stream,bits)
            $136.c=
              readFb($bytes,$stream,bits)
          }
          else{

            $136.b=
              0
            $136.c=
              0
          }
          var bits=
            readUb($bytes,$stream,5)
          var e=
            readSb($bytes,$stream,bits)
          var f=
            readSb($bytes,$stream,bits)
          $136.tx=
            e/20
          $136.ty=
            f/20
          align($bytes,$stream)
          if(isMorph){
            var $137=$124.matrixMorph={}
            align($bytes,$stream)
            var hasScale=
              readUb($bytes,$stream,1)
            if(hasScale){

              var bits=
                readUb($bytes,$stream,5)
              $137.a=
                readFb($bytes,$stream,bits)
              $137.d=
                readFb($bytes,$stream,bits)
            }
            else{

              $137.a=
                1
              $137.d=
                1
            }
            var hasRotate=
              readUb($bytes,$stream,1)
            if(hasRotate){

              var bits=
                readUb($bytes,$stream,5)
              $137.b=
                readFb($bytes,$stream,bits)
              $137.c=
                readFb($bytes,$stream,bits)
            }
            else{

              $137.b=
                0
              $137.c=
                0
            }
            var bits=
              readUb($bytes,$stream,5)
            var e=
              readSb($bytes,$stream,bits)
            var f=
              readSb($bytes,$stream,bits)
            $137.tx=
              e/20
            $137.ty=
              f/20
            align($bytes,$stream)
          }
          $124.condition=
            type===64||type===67
          break
        default:
        }
        $122.push($124)}

      var tmp=
        readUi8($bytes,$stream)
      if(tagCode>2&&tmp===255){
        var count=
          readUi16($bytes,$stream)
      }
      else{
        var count=
          tmp
      }
      var $138=
        $.lineStyles=
        []
      var $139=count
      while($139--){
        var $140={}
        $140.width=
          readUi16($bytes,$stream)
        if(isMorph){
          $140.widthMorph=
            readUi16($bytes,$stream)
        }
        if(hasStrokes){

          align($bytes,$stream)
          $140.startCapStyle=
            readUb($bytes,$stream,2)
          var joinStyle=
            $140.joinStyle=
            readUb($bytes,$stream,2)
          var hasFill=
            $140.hasFill=
            readUb($bytes,$stream,1)
          $140.noHscale=
            readUb($bytes,$stream,1)
          $140.noVscale=
            readUb($bytes,$stream,1)
          $140.pixelHinting=
            readUb($bytes,$stream,1)
          var reserved=
            readUb($bytes,$stream,5)
          $140.noClose=
            readUb($bytes,$stream,1)
          $140.endCapStyle=
            readUb($bytes,$stream,2)
          if(joinStyle===2){
            $140.miterLimitFactor=
              readFixed8($bytes,$stream)
          }
          if(hasFill){

            var $141=$140.fillStyle={}
            var type=
              $141.type=
              readUi8($bytes,$stream)
            switch(type){
            case 0:

              if(tagCode>22||isMorph){
                var $142=$141.color={}
                $142.red=
                  readUi8($bytes,$stream)
                $142.green=
                  readUi8($bytes,$stream)
                $142.blue=
                  readUi8($bytes,$stream)
                $142.alpha=
                  readUi8($bytes,$stream)
              }
              else{
                var $143=$141.color={}
                $143.red=
                  readUi8($bytes,$stream)
                $143.green=
                  readUi8($bytes,$stream)
                $143.blue=
                  readUi8($bytes,$stream)
                $143.alpha=
                  255
              }
              if(isMorph){
                var $144=$141.colorMorph={}
                $144.red=
                  readUi8($bytes,$stream)
                $144.green=
                  readUi8($bytes,$stream)
                $144.blue=
                  readUi8($bytes,$stream)
                $144.alpha=
                  readUi8($bytes,$stream)
              }
              break
            case 16:
            case 18:
            case 19:

              var $145=$141.matrix={}
              align($bytes,$stream)
              var hasScale=
                readUb($bytes,$stream,1)
              if(hasScale){

                var bits=
                  readUb($bytes,$stream,5)
                $145.a=
                  readFb($bytes,$stream,bits)
                $145.d=
                  readFb($bytes,$stream,bits)
              }
              else{

                $145.a=
                  1
                $145.d=
                  1
              }
              var hasRotate=
                readUb($bytes,$stream,1)
              if(hasRotate){

                var bits=
                  readUb($bytes,$stream,5)
                $145.b=
                  readFb($bytes,$stream,bits)
                $145.c=
                  readFb($bytes,$stream,bits)
              }
              else{

                $145.b=
                  0
                $145.c=
                  0
              }
              var bits=
                readUb($bytes,$stream,5)
              var e=
                readSb($bytes,$stream,bits)
              var f=
                readSb($bytes,$stream,bits)
              $145.tx=
                e/20
              $145.ty=
                f/20
              align($bytes,$stream)
              if(isMorph){
                var $146=$141.matrixMorph={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $146.a=
                    readFb($bytes,$stream,bits)
                  $146.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $146.a=
                    1
                  $146.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $146.b=
                    readFb($bytes,$stream,bits)
                  $146.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $146.b=
                    0
                  $146.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $146.tx=
                  e/20
                $146.ty=
                  f/20
                align($bytes,$stream)
              }

              if(tagCode===83){

                $141.spreadMode=
                  readUb($bytes,$stream,2)
                $141.interpolationMode=
                  readUb($bytes,$stream,2)
              }
              else{

                var pad=
                  readUb($bytes,$stream,4)
              }
              var count=
                $141.count=
                readUb($bytes,$stream,4)
              var $147=
                $141.records=
                []
              var $148=count
              while($148--){
                var $149={}
                $149.ratio=
                  readUi8($bytes,$stream)
                if(tagCode>22){
                  var $150=$149.color={}
                  $150.red=
                    readUi8($bytes,$stream)
                  $150.green=
                    readUi8($bytes,$stream)
                  $150.blue=
                    readUi8($bytes,$stream)
                  $150.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $151=$149.color={}
                  $151.red=
                    readUi8($bytes,$stream)
                  $151.green=
                    readUi8($bytes,$stream)
                  $151.blue=
                    readUi8($bytes,$stream)
                  $151.alpha=
                    255
                }
                if(isMorph){

                  $149.ratioMorph=
                    readUi8($bytes,$stream)
                  var $152=$149.colorMorph={}
                  $152.red=
                    readUi8($bytes,$stream)
                  $152.green=
                    readUi8($bytes,$stream)
                  $152.blue=
                    readUi8($bytes,$stream)
                  $152.alpha=
                    readUi8($bytes,$stream)
                }
                $147.push($149)}
              if(type===19){

                $141.focalPoint=
                  readFixed8($bytes,$stream)
                if(isMorph){
                  $141.focalPointMorph=
                    readFixed8($bytes,$stream)
                }
              }
              break
            case 64:
            case 65:
            case 66:
            case 67:

              $141.bitmapId=
                readUi16($bytes,$stream)
              var $153=$141.matrix={}
              align($bytes,$stream)
              var hasScale=
                readUb($bytes,$stream,1)
              if(hasScale){

                var bits=
                  readUb($bytes,$stream,5)
                $153.a=
                  readFb($bytes,$stream,bits)
                $153.d=
                  readFb($bytes,$stream,bits)
              }
              else{

                $153.a=
                  1
                $153.d=
                  1
              }
              var hasRotate=
                readUb($bytes,$stream,1)
              if(hasRotate){

                var bits=
                  readUb($bytes,$stream,5)
                $153.b=
                  readFb($bytes,$stream,bits)
                $153.c=
                  readFb($bytes,$stream,bits)
              }
              else{

                $153.b=
                  0
                $153.c=
                  0
              }
              var bits=
                readUb($bytes,$stream,5)
              var e=
                readSb($bytes,$stream,bits)
              var f=
                readSb($bytes,$stream,bits)
              $153.tx=
                e/20
              $153.ty=
                f/20
              align($bytes,$stream)
              if(isMorph){
                var $154=$141.matrixMorph={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $154.a=
                    readFb($bytes,$stream,bits)
                  $154.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $154.a=
                    1
                  $154.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $154.b=
                    readFb($bytes,$stream,bits)
                  $154.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $154.b=
                    0
                  $154.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $154.tx=
                  e/20
                $154.ty=
                  f/20
                align($bytes,$stream)
              }
              $141.condition=
                type===64||type===67
              break
            default:
            }
          }
          else{

            var $155=$140.color={}
            $155.red=
              readUi8($bytes,$stream)
            $155.green=
              readUi8($bytes,$stream)
            $155.blue=
              readUi8($bytes,$stream)
            $155.alpha=
              readUi8($bytes,$stream)
            if(isMorph){
              var $156=$140.colorMorph={}
              $156.red=
                readUi8($bytes,$stream)
              $156.green=
                readUi8($bytes,$stream)
              $156.blue=
                readUi8($bytes,$stream)
              $156.alpha=
                readUi8($bytes,$stream)
            }
          }
        }
        else{

          if(tagCode>22){
            var $157=$140.color={}
            $157.red=
              readUi8($bytes,$stream)
            $157.green=
              readUi8($bytes,$stream)
            $157.blue=
              readUi8($bytes,$stream)
            $157.alpha=
              readUi8($bytes,$stream)
          }
          else{
            var $158=$140.color={}
            $158.red=
              readUi8($bytes,$stream)
            $158.green=
              readUi8($bytes,$stream)
            $158.blue=
              readUi8($bytes,$stream)
            $158.alpha=
              255
          }
          if(isMorph){
            var $159=$140.colorMorph={}
            $159.red=
              readUi8($bytes,$stream)
            $159.green=
              readUi8($bytes,$stream)
            $159.blue=
              readUi8($bytes,$stream)
            $159.alpha=
              readUi8($bytes,$stream)
          }
        }
        $138.push($140)}

      align($bytes,$stream)
      var fillBits=
        readUb($bytes,$stream,4)
      var lineBits=
        readUb($bytes,$stream,4)
      var $160=
        $.records=
        []
      do{
        var $161={}
        var type=
          $161.type=
          readUb($bytes,$stream,1)
        var flags=
          readUb($bytes,$stream,5)
        var eos=
          $161.eos=
          !(type||flags)
        if(type){

          var isStraight=
            $161.isStraight=
            flags>>4
          var tmp=
            flags&0x0f
          var bits=
            tmp+2
          if(isStraight){

            var isGeneral=
              $161.isGeneral=
              readUb($bytes,$stream,1)
            if(isGeneral){

              $161.deltaX=
                readSb($bytes,$stream,bits)
              $161.deltaY=
                readSb($bytes,$stream,bits)
            }
            else{

              var isVertical=
                $161.isVertical=
                readUb($bytes,$stream,1)
              if(isVertical){

                $161.deltaY=
                  readSb($bytes,$stream,bits)
              }
              else{

                $161.deltaX=
                  readSb($bytes,$stream,bits)
              }
            }
          }
          else{

            $161.controlDeltaX=
              readSb($bytes,$stream,bits)
            $161.controlDeltaY=
              readSb($bytes,$stream,bits)
            $161.anchorDeltaX=
              readSb($bytes,$stream,bits)
            $161.anchorDeltaY=
              readSb($bytes,$stream,bits)
          }
        }
        else{

          if(tagCode>2){
            var hasNewStyles=$161.hasNewStyles=
              flags>>4
          }
          else{
            var hasNewStyles=$161.hasNewStyles=
              0
          }
          var hasLineStyle=
            $161.hasLineStyle=
            flags>>3&1
          var hasFillStyle1=
            $161.hasFillStyle1=
            flags>>2&1
          var hasFillStyle0=
            $161.hasFillStyle0=
            flags>>1&1
          var move=
            $161.move=
            flags&1
          if(move){

            var bits=
              readUb($bytes,$stream,5)
            $161.moveX=
              readSb($bytes,$stream,bits)
            $161.moveY=
              readSb($bytes,$stream,bits)
          }
          if(hasFillStyle0){
            $161.fillStyle0=
              readUb($bytes,$stream,fillBits)
          }
          if(hasFillStyle1){
            $161.fillStyle1=
              readUb($bytes,$stream,fillBits)
          }
          if(hasLineStyle){
            $161.lineStyle=
              readUb($bytes,$stream,lineBits)
          }
          if(hasNewStyles){


            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $162=
              $161.fillStyles=
              []
            var $163=count
            while($163--){
              var $164={}
              var type=
                $164.type=
                readUi8($bytes,$stream)
              switch(type){
              case 0:

                if(tagCode>22||isMorph){
                  var $165=$164.color={}
                  $165.red=
                    readUi8($bytes,$stream)
                  $165.green=
                    readUi8($bytes,$stream)
                  $165.blue=
                    readUi8($bytes,$stream)
                  $165.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $166=$164.color={}
                  $166.red=
                    readUi8($bytes,$stream)
                  $166.green=
                    readUi8($bytes,$stream)
                  $166.blue=
                    readUi8($bytes,$stream)
                  $166.alpha=
                    255
                }
                if(isMorph){
                  var $167=$164.colorMorph={}
                  $167.red=
                    readUi8($bytes,$stream)
                  $167.green=
                    readUi8($bytes,$stream)
                  $167.blue=
                    readUi8($bytes,$stream)
                  $167.alpha=
                    readUi8($bytes,$stream)
                }
                break
              case 16:
              case 18:
              case 19:

                var $168=$164.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $168.a=
                    readFb($bytes,$stream,bits)
                  $168.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $168.a=
                    1
                  $168.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $168.b=
                    readFb($bytes,$stream,bits)
                  $168.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $168.b=
                    0
                  $168.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $168.tx=
                  e/20
                $168.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $169=$164.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $169.a=
                      readFb($bytes,$stream,bits)
                    $169.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $169.a=
                      1
                    $169.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $169.b=
                      readFb($bytes,$stream,bits)
                    $169.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $169.b=
                      0
                    $169.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $169.tx=
                    e/20
                  $169.ty=
                    f/20
                  align($bytes,$stream)
                }

                if(tagCode===83){

                  $164.spreadMode=
                    readUb($bytes,$stream,2)
                  $164.interpolationMode=
                    readUb($bytes,$stream,2)
                }
                else{

                  var pad=
                    readUb($bytes,$stream,4)
                }
                var count=
                  $164.count=
                  readUb($bytes,$stream,4)
                var $170=
                  $164.records=
                  []
                var $171=count
                while($171--){
                  var $172={}
                  $172.ratio=
                    readUi8($bytes,$stream)
                  if(tagCode>22){
                    var $173=$172.color={}
                    $173.red=
                      readUi8($bytes,$stream)
                    $173.green=
                      readUi8($bytes,$stream)
                    $173.blue=
                      readUi8($bytes,$stream)
                    $173.alpha=
                      readUi8($bytes,$stream)
                  }
                  else{
                    var $174=$172.color={}
                    $174.red=
                      readUi8($bytes,$stream)
                    $174.green=
                      readUi8($bytes,$stream)
                    $174.blue=
                      readUi8($bytes,$stream)
                    $174.alpha=
                      255
                  }
                  if(isMorph){

                    $172.ratioMorph=
                      readUi8($bytes,$stream)
                    var $175=$172.colorMorph={}
                    $175.red=
                      readUi8($bytes,$stream)
                    $175.green=
                      readUi8($bytes,$stream)
                    $175.blue=
                      readUi8($bytes,$stream)
                    $175.alpha=
                      readUi8($bytes,$stream)
                  }
                  $170.push($172)}
                if(type===19){

                  $164.focalPoint=
                    readFixed8($bytes,$stream)
                  if(isMorph){
                    $164.focalPointMorph=
                      readFixed8($bytes,$stream)
                  }
                }
                break
              case 64:
              case 65:
              case 66:
              case 67:

                $164.bitmapId=
                  readUi16($bytes,$stream)
                var $176=$164.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $176.a=
                    readFb($bytes,$stream,bits)
                  $176.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $176.a=
                    1
                  $176.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $176.b=
                    readFb($bytes,$stream,bits)
                  $176.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $176.b=
                    0
                  $176.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $176.tx=
                  e/20
                $176.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $177=$164.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $177.a=
                      readFb($bytes,$stream,bits)
                    $177.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $177.a=
                      1
                    $177.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $177.b=
                      readFb($bytes,$stream,bits)
                    $177.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $177.b=
                      0
                    $177.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $177.tx=
                    e/20
                  $177.ty=
                    f/20
                  align($bytes,$stream)
                }
                $164.condition=
                  type===64||type===67
                break
              default:
              }
              $162.push($164)}

            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $178=
              $161.lineStyles=
              []
            var $179=count
            while($179--){
              var $180={}
              $180.width=
                readUi16($bytes,$stream)
              if(isMorph){
                $180.widthMorph=
                  readUi16($bytes,$stream)
              }
              if(hasStrokes){

                align($bytes,$stream)
                $180.startCapStyle=
                  readUb($bytes,$stream,2)
                var joinStyle=
                  $180.joinStyle=
                  readUb($bytes,$stream,2)
                var hasFill=
                  $180.hasFill=
                  readUb($bytes,$stream,1)
                $180.noHscale=
                  readUb($bytes,$stream,1)
                $180.noVscale=
                  readUb($bytes,$stream,1)
                $180.pixelHinting=
                  readUb($bytes,$stream,1)
                var reserved=
                  readUb($bytes,$stream,5)
                $180.noClose=
                  readUb($bytes,$stream,1)
                $180.endCapStyle=
                  readUb($bytes,$stream,2)
                if(joinStyle===2){
                  $180.miterLimitFactor=
                    readFixed8($bytes,$stream)
                }
                if(hasFill){

                  var $181=$180.fillStyle={}
                  var type=
                    $181.type=
                    readUi8($bytes,$stream)
                  switch(type){
                  case 0:

                    if(tagCode>22||isMorph){
                      var $182=$181.color={}
                      $182.red=
                        readUi8($bytes,$stream)
                      $182.green=
                        readUi8($bytes,$stream)
                      $182.blue=
                        readUi8($bytes,$stream)
                      $182.alpha=
                        readUi8($bytes,$stream)
                    }
                    else{
                      var $183=$181.color={}
                      $183.red=
                        readUi8($bytes,$stream)
                      $183.green=
                        readUi8($bytes,$stream)
                      $183.blue=
                        readUi8($bytes,$stream)
                      $183.alpha=
                        255
                    }
                    if(isMorph){
                      var $184=$181.colorMorph={}
                      $184.red=
                        readUi8($bytes,$stream)
                      $184.green=
                        readUi8($bytes,$stream)
                      $184.blue=
                        readUi8($bytes,$stream)
                      $184.alpha=
                        readUi8($bytes,$stream)
                    }
                    break
                  case 16:
                  case 18:
                  case 19:

                    var $185=$181.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $185.a=
                        readFb($bytes,$stream,bits)
                      $185.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $185.a=
                        1
                      $185.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $185.b=
                        readFb($bytes,$stream,bits)
                      $185.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $185.b=
                        0
                      $185.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $185.tx=
                      e/20
                    $185.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $186=$181.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $186.a=
                          readFb($bytes,$stream,bits)
                        $186.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $186.a=
                          1
                        $186.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $186.b=
                          readFb($bytes,$stream,bits)
                        $186.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $186.b=
                          0
                        $186.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $186.tx=
                        e/20
                      $186.ty=
                        f/20
                      align($bytes,$stream)
                    }

                    if(tagCode===83){

                      $181.spreadMode=
                        readUb($bytes,$stream,2)
                      $181.interpolationMode=
                        readUb($bytes,$stream,2)
                    }
                    else{

                      var pad=
                        readUb($bytes,$stream,4)
                    }
                    var count=
                      $181.count=
                      readUb($bytes,$stream,4)
                    var $187=
                      $181.records=
                      []
                    var $188=count
                    while($188--){
                      var $189={}
                      $189.ratio=
                        readUi8($bytes,$stream)
                      if(tagCode>22){
                        var $190=$189.color={}
                        $190.red=
                          readUi8($bytes,$stream)
                        $190.green=
                          readUi8($bytes,$stream)
                        $190.blue=
                          readUi8($bytes,$stream)
                        $190.alpha=
                          readUi8($bytes,$stream)
                      }
                      else{
                        var $191=$189.color={}
                        $191.red=
                          readUi8($bytes,$stream)
                        $191.green=
                          readUi8($bytes,$stream)
                        $191.blue=
                          readUi8($bytes,$stream)
                        $191.alpha=
                          255
                      }
                      if(isMorph){

                        $189.ratioMorph=
                          readUi8($bytes,$stream)
                        var $192=$189.colorMorph={}
                        $192.red=
                          readUi8($bytes,$stream)
                        $192.green=
                          readUi8($bytes,$stream)
                        $192.blue=
                          readUi8($bytes,$stream)
                        $192.alpha=
                          readUi8($bytes,$stream)
                      }
                      $187.push($189)}
                    if(type===19){

                      $181.focalPoint=
                        readFixed8($bytes,$stream)
                      if(isMorph){
                        $181.focalPointMorph=
                          readFixed8($bytes,$stream)
                      }
                    }
                    break
                  case 64:
                  case 65:
                  case 66:
                  case 67:

                    $181.bitmapId=
                      readUi16($bytes,$stream)
                    var $193=$181.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $193.a=
                        readFb($bytes,$stream,bits)
                      $193.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $193.a=
                        1
                      $193.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $193.b=
                        readFb($bytes,$stream,bits)
                      $193.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $193.b=
                        0
                      $193.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $193.tx=
                      e/20
                    $193.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $194=$181.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $194.a=
                          readFb($bytes,$stream,bits)
                        $194.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $194.a=
                          1
                        $194.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $194.b=
                          readFb($bytes,$stream,bits)
                        $194.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $194.b=
                          0
                        $194.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $194.tx=
                        e/20
                      $194.ty=
                        f/20
                      align($bytes,$stream)
                    }
                    $181.condition=
                      type===64||type===67
                    break
                  default:
                  }
                }
                else{

                  var $195=$180.color={}
                  $195.red=
                    readUi8($bytes,$stream)
                  $195.green=
                    readUi8($bytes,$stream)
                  $195.blue=
                    readUi8($bytes,$stream)
                  $195.alpha=
                    readUi8($bytes,$stream)
                  if(isMorph){
                    var $196=$180.colorMorph={}
                    $196.red=
                      readUi8($bytes,$stream)
                    $196.green=
                      readUi8($bytes,$stream)
                    $196.blue=
                      readUi8($bytes,$stream)
                    $196.alpha=
                      readUi8($bytes,$stream)
                  }
                }
              }
              else{

                if(tagCode>22){
                  var $197=$180.color={}
                  $197.red=
                    readUi8($bytes,$stream)
                  $197.green=
                    readUi8($bytes,$stream)
                  $197.blue=
                    readUi8($bytes,$stream)
                  $197.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $198=$180.color={}
                  $198.red=
                    readUi8($bytes,$stream)
                  $198.green=
                    readUi8($bytes,$stream)
                  $198.blue=
                    readUi8($bytes,$stream)
                  $198.alpha=
                    255
                }
                if(isMorph){
                  var $199=$180.colorMorph={}
                  $199.red=
                    readUi8($bytes,$stream)
                  $199.green=
                    readUi8($bytes,$stream)
                  $199.blue=
                    readUi8($bytes,$stream)
                  $199.alpha=
                    readUi8($bytes,$stream)
                }
              }
              $178.push($180)}

            align($bytes,$stream)
            var fillBits=
              readUb($bytes,$stream,4)
            var lineBits=
              readUb($bytes,$stream,4)
          }
        }
        $160.push($161)}
      while(!eos)
    }
    return $
  }

  function placeObject($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    if(tagCode>4){

      if(tagCode>26){
        var flags=
          readUi16($bytes,$stream)
      }
      else{
        var flags=
          readUi8($bytes,$stream)
      }
      var hasEvents=
        $.hasEvents=
        flags>>7&1
      var clip=
        $.clip=
        flags>>6&1
      var hasName=
        $.hasName=
        flags>>5&1
      var hasRatio=
        $.hasRatio=
        flags>>4&1
      var hasCxform=
        $.hasCxform=
        flags>>3&1
      var hasMatrix=
        $.hasMatrix=
        flags>>2&1
      var place=
        $.place=
        flags>>1&1
      var move=
        $.move=
        flags&1
      if(tagCode===70){

        var hasBackgroundColor=
          $.hasBackgroundColor=
          flags>>15&1
        var hasVisibility=
          $.hasVisibility=
          flags>>14&1
        var hasImage=
          $.hasImage=
          flags>>12&1
        var hasClassName=
          $.hasClassName=
          flags>>11&1
        var cache=
          $.cache=
          flags>>10&1
        var blend=
          $.blend=
          flags>>9&1
        var hasFilters=
          $.hasFilters=
          flags>>8&1
      }
      else{

        var cache=
          $.cache=
          0
        var blend=
          $.blend=
          0
        var hasFilters=
          $.hasFilters=
          0
      }
      $.depth=
        readUi16($bytes,$stream)
      if(hasClassName){
        $.className=
          readString($bytes,$stream,0)
      }
      if(place){
        $.symbolId=
          readUi16($bytes,$stream)
      }
      if(hasMatrix){
        var $0=$.matrix={}
        align($bytes,$stream)
        var hasScale=
          readUb($bytes,$stream,1)
        if(hasScale){

          var bits=
            readUb($bytes,$stream,5)
          $0.a=
            readFb($bytes,$stream,bits)
          $0.d=
            readFb($bytes,$stream,bits)
        }
        else{

          $0.a=
            1
          $0.d=
            1
        }
        var hasRotate=
          readUb($bytes,$stream,1)
        if(hasRotate){

          var bits=
            readUb($bytes,$stream,5)
          $0.b=
            readFb($bytes,$stream,bits)
          $0.c=
            readFb($bytes,$stream,bits)
        }
        else{

          $0.b=
            0
          $0.c=
            0
        }
        var bits=
          readUb($bytes,$stream,5)
        var e=
          readSb($bytes,$stream,bits)
        var f=
          readSb($bytes,$stream,bits)
        $0.tx=
          e/20
        $0.ty=
          f/20
        align($bytes,$stream)
      }
      if(hasCxform){
        var $1=$.cxform={}
        align($bytes,$stream)
        var hasOffsets=
          readUb($bytes,$stream,1)
        var hasMultipliers=
          readUb($bytes,$stream,1)
        var bits=
          readUb($bytes,$stream,4)
        if(hasMultipliers){

          $1.redMultiplier=
            readSb($bytes,$stream,bits)
          $1.greenMultiplier=
            readSb($bytes,$stream,bits)
          $1.blueMultiplier=
            readSb($bytes,$stream,bits)
          if(tagCode>4){
            $1.alphaMultiplier=
              readSb($bytes,$stream,bits)
          }
          else{
            $1.alphaMultiplier=
              256
          }
        }
        else{

          $1.redMultiplier=
            256
          $1.greenMultiplier=
            256
          $1.blueMultiplier=
            256
          $1.alphaMultiplier=
            256
        }
        if(hasOffsets){

          $1.redOffset=
            readSb($bytes,$stream,bits)
          $1.greenOffset=
            readSb($bytes,$stream,bits)
          $1.blueOffset=
            readSb($bytes,$stream,bits)
          if(tagCode>4){
            $1.alphaOffset=
              readSb($bytes,$stream,bits)
          }
          else{
            $1.alphaOffset=
              0
          }
        }
        else{

          $1.redOffset=
            0
          $1.greenOffset=
            0
          $1.blueOffset=
            0
          $1.alphaOffset=
            0
        }
        align($bytes,$stream)
      }
      if(hasRatio){
        $.ratio=
          readUi16($bytes,$stream)
      }
      if(hasName){
        $.name=
          readString($bytes,$stream,0)
      }
      if(clip){
        $.clipDepth=
          readUi16($bytes,$stream)
      }
      if(hasFilters){

        var count=
          readUi8($bytes,$stream)
        var $2=
          $.filters=
          []
        var $3=count
        while($3--){
          var $4={}
          var type=
            $4.type=
            readUi8($bytes,$stream)
          switch(type){
          case 0:

            if(type===4||type===7){
              var count=
                readUi8($bytes,$stream)
            }
            else{
              var count=
                1
            }
            var $5=
              $4.colors=
              []
            var $6=count
            while($6--){
              var $7={}
              $7.red=
                readUi8($bytes,$stream)
              $7.green=
                readUi8($bytes,$stream)
              $7.blue=
                readUi8($bytes,$stream)
              $7.alpha=
                readUi8($bytes,$stream)
              $5.push($7)}
            if(type===3){
              var $8=$4.higlightColor={}
              $8.red=
                readUi8($bytes,$stream)
              $8.green=
                readUi8($bytes,$stream)
              $8.blue=
                readUi8($bytes,$stream)
              $8.alpha=
                readUi8($bytes,$stream)
            }
            if(type===4||type===7){

              var $9=
                $4.ratios=
                []
              var $10=count
              while($10--){
                $9.push(
                  readUi8($bytes,$stream)
                )}
            }
            $4.blurX=
              readFixed($bytes,$stream)
            $4.blurY=
              readFixed($bytes,$stream)
            if(type!==2){

              $4.angle=
                readFixed($bytes,$stream)
              $4.distance=
                readFixed($bytes,$stream)
            }
            $4.strength=
              readFixed8($bytes,$stream)
            $4.innerShadow=
              readUb($bytes,$stream,1)
            $4.knockout=
              readUb($bytes,$stream,1)
            $4.compositeSource=
              readUb($bytes,$stream,1)
            if(type===3){

              $4.onTop=
                readUb($bytes,$stream,1)
            }
            else{

              var reserved=
                readUb($bytes,$stream,1)
            }
            if(type===4||type===7){

              $4.passes=
                readUb($bytes,$stream,4)
            }
            else{

              var reserved=
                readUb($bytes,$stream,4)
            }
            break
          case 1:

            $4.blurX=
              readFixed($bytes,$stream)
            $4.blurY=
              readFixed($bytes,$stream)
            $4.passes=
              readUb($bytes,$stream,5)
            var reserved=
              readUb($bytes,$stream,3)
            break
          case 2:
          case 3:
          case 4:

            if(type===4||type===7){
              var count=
                readUi8($bytes,$stream)
            }
            else{
              var count=
                1
            }
            var $11=
              $4.colors=
              []
            var $12=count
            while($12--){
              var $13={}
              $13.red=
                readUi8($bytes,$stream)
              $13.green=
                readUi8($bytes,$stream)
              $13.blue=
                readUi8($bytes,$stream)
              $13.alpha=
                readUi8($bytes,$stream)
              $11.push($13)}
            if(type===3){
              var $14=$4.higlightColor={}
              $14.red=
                readUi8($bytes,$stream)
              $14.green=
                readUi8($bytes,$stream)
              $14.blue=
                readUi8($bytes,$stream)
              $14.alpha=
                readUi8($bytes,$stream)
            }
            if(type===4||type===7){

              var $15=
                $4.ratios=
                []
              var $16=count
              while($16--){
                $15.push(
                  readUi8($bytes,$stream)
                )}
            }
            $4.blurX=
              readFixed($bytes,$stream)
            $4.blurY=
              readFixed($bytes,$stream)
            if(type!==2){

              $4.angle=
                readFixed($bytes,$stream)
              $4.distance=
                readFixed($bytes,$stream)
            }
            $4.strength=
              readFixed8($bytes,$stream)
            $4.innerShadow=
              readUb($bytes,$stream,1)
            $4.knockout=
              readUb($bytes,$stream,1)
            $4.compositeSource=
              readUb($bytes,$stream,1)
            if(type===3){

              $4.onTop=
                readUb($bytes,$stream,1)
            }
            else{

              var reserved=
                readUb($bytes,$stream,1)
            }
            if(type===4||type===7){

              $4.passes=
                readUb($bytes,$stream,4)
            }
            else{

              var reserved=
                readUb($bytes,$stream,4)
            }
            break
          case 5:

            $4.columns=
              readUi8($bytes,$stream)
            $4.rows=
              readUi8($bytes,$stream)
            $4.divisor=
              readFloat($bytes,$stream)
            $4.bias=
              readFloat($bytes,$stream)
            var $17=
              $4.weights=
              []
            var $18=columns*rows
            while($18--){
              $17.push(
                readFloat($bytes,$stream)
              )}
            var $19=$4.defaultColor={}
            $19.red=
              readUi8($bytes,$stream)
            $19.green=
              readUi8($bytes,$stream)
            $19.blue=
              readUi8($bytes,$stream)
            $19.alpha=
              readUi8($bytes,$stream)
            var reserved=
              readUb($bytes,$stream,6)
            $4.clamp=
              readUb($bytes,$stream,1)
            $4.preserveAlpha=
              readUb($bytes,$stream,1)
            break
          case 6:

            var $20=
              $4.matrix=
              []
            var $21=20
            while($21--){
              $20.push(
                readFloat($bytes,$stream)
              )}
            break
          case 7:

            if(type===4||type===7){
              var count=
                readUi8($bytes,$stream)
            }
            else{
              var count=
                1
            }
            var $22=
              $4.colors=
              []
            var $23=count
            while($23--){
              var $24={}
              $24.red=
                readUi8($bytes,$stream)
              $24.green=
                readUi8($bytes,$stream)
              $24.blue=
                readUi8($bytes,$stream)
              $24.alpha=
                readUi8($bytes,$stream)
              $22.push($24)}
            if(type===3){
              var $25=$4.higlightColor={}
              $25.red=
                readUi8($bytes,$stream)
              $25.green=
                readUi8($bytes,$stream)
              $25.blue=
                readUi8($bytes,$stream)
              $25.alpha=
                readUi8($bytes,$stream)
            }
            if(type===4||type===7){

              var $26=
                $4.ratios=
                []
              var $27=count
              while($27--){
                $26.push(
                  readUi8($bytes,$stream)
                )}
            }
            $4.blurX=
              readFixed($bytes,$stream)
            $4.blurY=
              readFixed($bytes,$stream)
            if(type!==2){

              $4.angle=
                readFixed($bytes,$stream)
              $4.distance=
                readFixed($bytes,$stream)
            }
            $4.strength=
              readFixed8($bytes,$stream)
            $4.innerShadow=
              readUb($bytes,$stream,1)
            $4.knockout=
              readUb($bytes,$stream,1)
            $4.compositeSource=
              readUb($bytes,$stream,1)
            if(type===3){

              $4.onTop=
                readUb($bytes,$stream,1)
            }
            else{

              var reserved=
                readUb($bytes,$stream,1)
            }
            if(type===4||type===7){

              $4.passes=
                readUb($bytes,$stream,4)
            }
            else{

              var reserved=
                readUb($bytes,$stream,4)
            }
            break
          default:
          }
          $2.push($4)}
      }
      if(blend){
        $.blendMode=
          readUi8($bytes,$stream)
      }
      if(cache){
        $.bmpCache=
          readUi8($bytes,$stream)
      }
      if(hasEvents){

        var reserved=
          readUi16($bytes,$stream)
        if(swfVersion>=6){
          var allFlags=
            readUi32($bytes,$stream)
        }
        else{
          var allFlags=
            readUi16($bytes,$stream)
        }
        var $28=
          $.events=
          []
        do{
          var $29={}
          if(swfVersion>=6){
            var flags=
              readUi32($bytes,$stream)
          }
          else{
            var flags=
              readUi16($bytes,$stream)
          }
          var eoe=
            $29.eoe=
            !flags
          $29.onKeyUp=
            flags>>7&1
          $29.onKeyDown=
            flags>>6&1
          $29.onMouseUp=
            flags>>5&1
          $29.onMouseDown=
            flags>>4&1
          $29.onMouseMove=
            flags>>3&1
          $29.onUnload=
            flags>>2&1
          $29.onEnterFrame=
            flags>>1&1
          $29.onLoad=
            flags&1
          if(swfVersion>=6){

            $29.onDragOver=
              flags>>15&1
            $29.onRollOut=
              flags>>14&1
            $29.onRollOver=
              flags>>13&1
            $29.onReleaseOutside=
              flags>>12&1
            $29.onRelease=
              flags>>11&1
            $29.onPress=
              flags>>10&1
            $29.onInitialize=
              flags>>9&1
            $29.onData=
              flags>>8&1
            if(swfVersion>=7){
              $29.onConstruct=
                flags>>18&1
            }
            else{
              $29.onConstruct=
                0
            }
            var keyPress=
              $29.keyPress=
              flags>>17&1
            $29.onDragOut=
              flags>>16&1
          }
          if(!eoe){

            var length=
              $29.length=
              readUi32($bytes,$stream)
            if(keyPress){
              $29.keyCode=
                readUi8($bytes,$stream)
            }
            $29.actionsData=
              readBinary($bytes,$stream,length - (keyPress ? 1 : 0))
          }
          $28.push($29)}
        while(!eoe)
      }
      if(hasBackgroundColor){
        $.backgroundColor=
          ARGB
      }
      if(hasVisibility){
        $.visibility=
          readUi8($bytes,$stream)
      }
    }
    else{

      $.place=
        1
      $.symbolId=
        readUi16($bytes,$stream)
      $.depth=
        readUi16($bytes,$stream)
      $.hasMatrix=
        1
      var $30=$.matrix={}
      align($bytes,$stream)
      var hasScale=
        readUb($bytes,$stream,1)
      if(hasScale){

        var bits=
          readUb($bytes,$stream,5)
        $30.a=
          readFb($bytes,$stream,bits)
        $30.d=
          readFb($bytes,$stream,bits)
      }
      else{

        $30.a=
          1
        $30.d=
          1
      }
      var hasRotate=
        readUb($bytes,$stream,1)
      if(hasRotate){

        var bits=
          readUb($bytes,$stream,5)
        $30.b=
          readFb($bytes,$stream,bits)
        $30.c=
          readFb($bytes,$stream,bits)
      }
      else{

        $30.b=
          0
        $30.c=
          0
      }
      var bits=
        readUb($bytes,$stream,5)
      var e=
        readSb($bytes,$stream,bits)
      var f=
        readSb($bytes,$stream,bits)
      $30.tx=
        e/20
      $30.ty=
        f/20
      align($bytes,$stream)
      if($stream.remaining()){

        $.hasCxform=
          1
        var $31=$.cxform={}
        align($bytes,$stream)
        var hasOffsets=
          readUb($bytes,$stream,1)
        var hasMultipliers=
          readUb($bytes,$stream,1)
        var bits=
          readUb($bytes,$stream,4)
        if(hasMultipliers){

          $31.redMultiplier=
            readSb($bytes,$stream,bits)
          $31.greenMultiplier=
            readSb($bytes,$stream,bits)
          $31.blueMultiplier=
            readSb($bytes,$stream,bits)
          if(tagCode>4){
            $31.alphaMultiplier=
              readSb($bytes,$stream,bits)
          }
          else{
            $31.alphaMultiplier=
              256
          }
        }
        else{

          $31.redMultiplier=
            256
          $31.greenMultiplier=
            256
          $31.blueMultiplier=
            256
          $31.alphaMultiplier=
            256
        }
        if(hasOffsets){

          $31.redOffset=
            readSb($bytes,$stream,bits)
          $31.greenOffset=
            readSb($bytes,$stream,bits)
          $31.blueOffset=
            readSb($bytes,$stream,bits)
          if(tagCode>4){
            $31.alphaOffset=
              readSb($bytes,$stream,bits)
          }
          else{
            $31.alphaOffset=
              0
          }
        }
        else{

          $31.redOffset=
            0
          $31.greenOffset=
            0
          $31.blueOffset=
            0
          $31.alphaOffset=
            0
        }
        align($bytes,$stream)
      }
    }
    return $
  }

  function removeObject($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    if(tagCode===5){
      $.symbolId=
        readUi16($bytes,$stream)
    }
    $.depth=
      readUi16($bytes,$stream)
    return $
  }

  function defineImage($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.id=
      readUi16($bytes,$stream)
    if(tagCode>21){

      var alphaDataOffset=
        readUi32($bytes,$stream)
      if(tagCode===90){
        $.deblock=
          readFixed8($bytes,$stream)
      }
      var imgData=
        $.imgData=
        readBinary($bytes,$stream,alphaDataOffset)
      $.alphaData=
        readBinary($bytes,$stream,0)
    }
    else{

      var imgData=
        $.imgData=
        readBinary($bytes,$stream,0)
    }
    switch(imgData[0]<<8|imgData[1]){
    case 65496:
    case 65497:
      $.mimeType=
        "image/jpeg"
      break
    case 35152:
      $.mimeType=
        "image/png"
      break
    case 18249:
      $.mimeType=
        "image/gif"
      break
    default:
      $.mimeType=
        "application/octet-stream"
    }
    if(tagCode===6){
      $.incomplete=
        1
    }
    return $
  }

  function defineButton($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.id=
      readUi16($bytes,$stream)
    if(tagCode==7){

      var $0=
        $.characters=
        []
      do{
        var $1={}
        var flags=
          readUi8($bytes,$stream)
        var eob=
          $1.eob=
          !flags
        if(swfVersion>=8){

          var blend=
            $1.blend=
            flags>>5&1
          var hasFilters=
            $1.hasFilters=
            flags>>4&1
        }
        else{

          var blend=
            $1.blend=
            0
          var hasFilters=
            $1.hasFilters=
            0
        }
        $1.stateHitTest=
          flags>>3&1
        $1.stateDown=
          flags>>2&1
        $1.stateOver=
          flags>>1&1
        $1.stateUp=
          flags&1
        if(!eob){

          $1.symbolId=
            readUi16($bytes,$stream)
          $1.depth=
            readUi16($bytes,$stream)
          var $2=$1.matrix={}
          align($bytes,$stream)
          var hasScale=
            readUb($bytes,$stream,1)
          if(hasScale){

            var bits=
              readUb($bytes,$stream,5)
            $2.a=
              readFb($bytes,$stream,bits)
            $2.d=
              readFb($bytes,$stream,bits)
          }
          else{

            $2.a=
              1
            $2.d=
              1
          }
          var hasRotate=
            readUb($bytes,$stream,1)
          if(hasRotate){

            var bits=
              readUb($bytes,$stream,5)
            $2.b=
              readFb($bytes,$stream,bits)
            $2.c=
              readFb($bytes,$stream,bits)
          }
          else{

            $2.b=
              0
            $2.c=
              0
          }
          var bits=
            readUb($bytes,$stream,5)
          var e=
            readSb($bytes,$stream,bits)
          var f=
            readSb($bytes,$stream,bits)
          $2.tx=
            e/20
          $2.ty=
            f/20
          align($bytes,$stream)
          if(tagCode===34){
            var $3=$1.cxform={}
            align($bytes,$stream)
            var hasOffsets=
              readUb($bytes,$stream,1)
            var hasMultipliers=
              readUb($bytes,$stream,1)
            var bits=
              readUb($bytes,$stream,4)
            if(hasMultipliers){

              $3.redMultiplier=
                readSb($bytes,$stream,bits)
              $3.greenMultiplier=
                readSb($bytes,$stream,bits)
              $3.blueMultiplier=
                readSb($bytes,$stream,bits)
              if(tagCode>4){
                $3.alphaMultiplier=
                  readSb($bytes,$stream,bits)
              }
              else{
                $3.alphaMultiplier=
                  256
              }
            }
            else{

              $3.redMultiplier=
                256
              $3.greenMultiplier=
                256
              $3.blueMultiplier=
                256
              $3.alphaMultiplier=
                256
            }
            if(hasOffsets){

              $3.redOffset=
                readSb($bytes,$stream,bits)
              $3.greenOffset=
                readSb($bytes,$stream,bits)
              $3.blueOffset=
                readSb($bytes,$stream,bits)
              if(tagCode>4){
                $3.alphaOffset=
                  readSb($bytes,$stream,bits)
              }
              else{
                $3.alphaOffset=
                  0
              }
            }
            else{

              $3.redOffset=
                0
              $3.greenOffset=
                0
              $3.blueOffset=
                0
              $3.alphaOffset=
                0
            }
            align($bytes,$stream)
          }
          if(hasFilters){

            $1.filterCount=
              readUi8($bytes,$stream)
            var $4=$1.filters={}
            var type=
              $4.type=
              readUi8($bytes,$stream)
            switch(type){
            case 0:

              if(type===4||type===7){
                var count=
                  readUi8($bytes,$stream)
              }
              else{
                var count=
                  1
              }
              var $5=
                $4.colors=
                []
              var $6=count
              while($6--){
                var $7={}
                $7.red=
                  readUi8($bytes,$stream)
                $7.green=
                  readUi8($bytes,$stream)
                $7.blue=
                  readUi8($bytes,$stream)
                $7.alpha=
                  readUi8($bytes,$stream)
                $5.push($7)}
              if(type===3){
                var $8=$4.higlightColor={}
                $8.red=
                  readUi8($bytes,$stream)
                $8.green=
                  readUi8($bytes,$stream)
                $8.blue=
                  readUi8($bytes,$stream)
                $8.alpha=
                  readUi8($bytes,$stream)
              }
              if(type===4||type===7){

                var $9=
                  $4.ratios=
                  []
                var $10=count
                while($10--){
                  $9.push(
                    readUi8($bytes,$stream)
                  )}
              }
              $4.blurX=
                readFixed($bytes,$stream)
              $4.blurY=
                readFixed($bytes,$stream)
              if(type!==2){

                $4.angle=
                  readFixed($bytes,$stream)
                $4.distance=
                  readFixed($bytes,$stream)
              }
              $4.strength=
                readFixed8($bytes,$stream)
              $4.innerShadow=
                readUb($bytes,$stream,1)
              $4.knockout=
                readUb($bytes,$stream,1)
              $4.compositeSource=
                readUb($bytes,$stream,1)
              if(type===3){

                $4.onTop=
                  readUb($bytes,$stream,1)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,1)
              }
              if(type===4||type===7){

                $4.passes=
                  readUb($bytes,$stream,4)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,4)
              }
              break
            case 1:

              $4.blurX=
                readFixed($bytes,$stream)
              $4.blurY=
                readFixed($bytes,$stream)
              $4.passes=
                readUb($bytes,$stream,5)
              var reserved=
                readUb($bytes,$stream,3)
              break
            case 2:
            case 3:
            case 4:

              if(type===4||type===7){
                var count=
                  readUi8($bytes,$stream)
              }
              else{
                var count=
                  1
              }
              var $11=
                $4.colors=
                []
              var $12=count
              while($12--){
                var $13={}
                $13.red=
                  readUi8($bytes,$stream)
                $13.green=
                  readUi8($bytes,$stream)
                $13.blue=
                  readUi8($bytes,$stream)
                $13.alpha=
                  readUi8($bytes,$stream)
                $11.push($13)}
              if(type===3){
                var $14=$4.higlightColor={}
                $14.red=
                  readUi8($bytes,$stream)
                $14.green=
                  readUi8($bytes,$stream)
                $14.blue=
                  readUi8($bytes,$stream)
                $14.alpha=
                  readUi8($bytes,$stream)
              }
              if(type===4||type===7){

                var $15=
                  $4.ratios=
                  []
                var $16=count
                while($16--){
                  $15.push(
                    readUi8($bytes,$stream)
                  )}
              }
              $4.blurX=
                readFixed($bytes,$stream)
              $4.blurY=
                readFixed($bytes,$stream)
              if(type!==2){

                $4.angle=
                  readFixed($bytes,$stream)
                $4.distance=
                  readFixed($bytes,$stream)
              }
              $4.strength=
                readFixed8($bytes,$stream)
              $4.innerShadow=
                readUb($bytes,$stream,1)
              $4.knockout=
                readUb($bytes,$stream,1)
              $4.compositeSource=
                readUb($bytes,$stream,1)
              if(type===3){

                $4.onTop=
                  readUb($bytes,$stream,1)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,1)
              }
              if(type===4||type===7){

                $4.passes=
                  readUb($bytes,$stream,4)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,4)
              }
              break
            case 5:

              $4.columns=
                readUi8($bytes,$stream)
              $4.rows=
                readUi8($bytes,$stream)
              $4.divisor=
                readFloat($bytes,$stream)
              $4.bias=
                readFloat($bytes,$stream)
              var $17=
                $4.weights=
                []
              var $18=columns*rows
              while($18--){
                $17.push(
                  readFloat($bytes,$stream)
                )}
              var $19=$4.defaultColor={}
              $19.red=
                readUi8($bytes,$stream)
              $19.green=
                readUi8($bytes,$stream)
              $19.blue=
                readUi8($bytes,$stream)
              $19.alpha=
                readUi8($bytes,$stream)
              var reserved=
                readUb($bytes,$stream,6)
              $4.clamp=
                readUb($bytes,$stream,1)
              $4.preserveAlpha=
                readUb($bytes,$stream,1)
              break
            case 6:

              var $20=
                $4.matrix=
                []
              var $21=20
              while($21--){
                $20.push(
                  readFloat($bytes,$stream)
                )}
              break
            case 7:

              if(type===4||type===7){
                var count=
                  readUi8($bytes,$stream)
              }
              else{
                var count=
                  1
              }
              var $22=
                $4.colors=
                []
              var $23=count
              while($23--){
                var $24={}
                $24.red=
                  readUi8($bytes,$stream)
                $24.green=
                  readUi8($bytes,$stream)
                $24.blue=
                  readUi8($bytes,$stream)
                $24.alpha=
                  readUi8($bytes,$stream)
                $22.push($24)}
              if(type===3){
                var $25=$4.higlightColor={}
                $25.red=
                  readUi8($bytes,$stream)
                $25.green=
                  readUi8($bytes,$stream)
                $25.blue=
                  readUi8($bytes,$stream)
                $25.alpha=
                  readUi8($bytes,$stream)
              }
              if(type===4||type===7){

                var $26=
                  $4.ratios=
                  []
                var $27=count
                while($27--){
                  $26.push(
                    readUi8($bytes,$stream)
                  )}
              }
              $4.blurX=
                readFixed($bytes,$stream)
              $4.blurY=
                readFixed($bytes,$stream)
              if(type!==2){

                $4.angle=
                  readFixed($bytes,$stream)
                $4.distance=
                  readFixed($bytes,$stream)
              }
              $4.strength=
                readFixed8($bytes,$stream)
              $4.innerShadow=
                readUb($bytes,$stream,1)
              $4.knockout=
                readUb($bytes,$stream,1)
              $4.compositeSource=
                readUb($bytes,$stream,1)
              if(type===3){

                $4.onTop=
                  readUb($bytes,$stream,1)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,1)
              }
              if(type===4||type===7){

                $4.passes=
                  readUb($bytes,$stream,4)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,4)
              }
              break
            default:
            }
          }
          if(blend){
            $1.blendMode=
              readUi8($bytes,$stream)
          }
        }
        $0.push($1)}
      while(!eob)
      $.actionsData=
        readBinary($bytes,$stream,0)
    }
    else{

      var trackFlags=
        readUi8($bytes,$stream)
      $.trackAsMenu=
        trackFlags>>7&1
      var actionOffset=
        readUi16($bytes,$stream)
      var $28=
        $.characters=
        []
      do{
        var $29={}
        var flags=
          readUi8($bytes,$stream)
        var eob=
          $29.eob=
          !flags
        if(swfVersion>=8){

          var blend=
            $29.blend=
            flags>>5&1
          var hasFilters=
            $29.hasFilters=
            flags>>4&1
        }
        else{

          var blend=
            $29.blend=
            0
          var hasFilters=
            $29.hasFilters=
            0
        }
        $29.stateHitTest=
          flags>>3&1
        $29.stateDown=
          flags>>2&1
        $29.stateOver=
          flags>>1&1
        $29.stateUp=
          flags&1
        if(!eob){

          $29.symbolId=
            readUi16($bytes,$stream)
          $29.depth=
            readUi16($bytes,$stream)
          var $30=$29.matrix={}
          align($bytes,$stream)
          var hasScale=
            readUb($bytes,$stream,1)
          if(hasScale){

            var bits=
              readUb($bytes,$stream,5)
            $30.a=
              readFb($bytes,$stream,bits)
            $30.d=
              readFb($bytes,$stream,bits)
          }
          else{

            $30.a=
              1
            $30.d=
              1
          }
          var hasRotate=
            readUb($bytes,$stream,1)
          if(hasRotate){

            var bits=
              readUb($bytes,$stream,5)
            $30.b=
              readFb($bytes,$stream,bits)
            $30.c=
              readFb($bytes,$stream,bits)
          }
          else{

            $30.b=
              0
            $30.c=
              0
          }
          var bits=
            readUb($bytes,$stream,5)
          var e=
            readSb($bytes,$stream,bits)
          var f=
            readSb($bytes,$stream,bits)
          $30.tx=
            e/20
          $30.ty=
            f/20
          align($bytes,$stream)
          if(tagCode===34){
            var $31=$29.cxform={}
            align($bytes,$stream)
            var hasOffsets=
              readUb($bytes,$stream,1)
            var hasMultipliers=
              readUb($bytes,$stream,1)
            var bits=
              readUb($bytes,$stream,4)
            if(hasMultipliers){

              $31.redMultiplier=
                readSb($bytes,$stream,bits)
              $31.greenMultiplier=
                readSb($bytes,$stream,bits)
              $31.blueMultiplier=
                readSb($bytes,$stream,bits)
              if(tagCode>4){
                $31.alphaMultiplier=
                  readSb($bytes,$stream,bits)
              }
              else{
                $31.alphaMultiplier=
                  256
              }
            }
            else{

              $31.redMultiplier=
                256
              $31.greenMultiplier=
                256
              $31.blueMultiplier=
                256
              $31.alphaMultiplier=
                256
            }
            if(hasOffsets){

              $31.redOffset=
                readSb($bytes,$stream,bits)
              $31.greenOffset=
                readSb($bytes,$stream,bits)
              $31.blueOffset=
                readSb($bytes,$stream,bits)
              if(tagCode>4){
                $31.alphaOffset=
                  readSb($bytes,$stream,bits)
              }
              else{
                $31.alphaOffset=
                  0
              }
            }
            else{

              $31.redOffset=
                0
              $31.greenOffset=
                0
              $31.blueOffset=
                0
              $31.alphaOffset=
                0
            }
            align($bytes,$stream)
          }
          if(hasFilters){

            $29.filterCount=
              readUi8($bytes,$stream)
            var $32=$29.filters={}
            var type=
              $32.type=
              readUi8($bytes,$stream)
            switch(type){
            case 0:

              if(type===4||type===7){
                var count=
                  readUi8($bytes,$stream)
              }
              else{
                var count=
                  1
              }
              var $33=
                $32.colors=
                []
              var $34=count
              while($34--){
                var $35={}
                $35.red=
                  readUi8($bytes,$stream)
                $35.green=
                  readUi8($bytes,$stream)
                $35.blue=
                  readUi8($bytes,$stream)
                $35.alpha=
                  readUi8($bytes,$stream)
                $33.push($35)}
              if(type===3){
                var $36=$32.higlightColor={}
                $36.red=
                  readUi8($bytes,$stream)
                $36.green=
                  readUi8($bytes,$stream)
                $36.blue=
                  readUi8($bytes,$stream)
                $36.alpha=
                  readUi8($bytes,$stream)
              }
              if(type===4||type===7){

                var $37=
                  $32.ratios=
                  []
                var $38=count
                while($38--){
                  $37.push(
                    readUi8($bytes,$stream)
                  )}
              }
              $32.blurX=
                readFixed($bytes,$stream)
              $32.blurY=
                readFixed($bytes,$stream)
              if(type!==2){

                $32.angle=
                  readFixed($bytes,$stream)
                $32.distance=
                  readFixed($bytes,$stream)
              }
              $32.strength=
                readFixed8($bytes,$stream)
              $32.innerShadow=
                readUb($bytes,$stream,1)
              $32.knockout=
                readUb($bytes,$stream,1)
              $32.compositeSource=
                readUb($bytes,$stream,1)
              if(type===3){

                $32.onTop=
                  readUb($bytes,$stream,1)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,1)
              }
              if(type===4||type===7){

                $32.passes=
                  readUb($bytes,$stream,4)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,4)
              }
              break
            case 1:

              $32.blurX=
                readFixed($bytes,$stream)
              $32.blurY=
                readFixed($bytes,$stream)
              $32.passes=
                readUb($bytes,$stream,5)
              var reserved=
                readUb($bytes,$stream,3)
              break
            case 2:
            case 3:
            case 4:

              if(type===4||type===7){
                var count=
                  readUi8($bytes,$stream)
              }
              else{
                var count=
                  1
              }
              var $39=
                $32.colors=
                []
              var $40=count
              while($40--){
                var $41={}
                $41.red=
                  readUi8($bytes,$stream)
                $41.green=
                  readUi8($bytes,$stream)
                $41.blue=
                  readUi8($bytes,$stream)
                $41.alpha=
                  readUi8($bytes,$stream)
                $39.push($41)}
              if(type===3){
                var $42=$32.higlightColor={}
                $42.red=
                  readUi8($bytes,$stream)
                $42.green=
                  readUi8($bytes,$stream)
                $42.blue=
                  readUi8($bytes,$stream)
                $42.alpha=
                  readUi8($bytes,$stream)
              }
              if(type===4||type===7){

                var $43=
                  $32.ratios=
                  []
                var $44=count
                while($44--){
                  $43.push(
                    readUi8($bytes,$stream)
                  )}
              }
              $32.blurX=
                readFixed($bytes,$stream)
              $32.blurY=
                readFixed($bytes,$stream)
              if(type!==2){

                $32.angle=
                  readFixed($bytes,$stream)
                $32.distance=
                  readFixed($bytes,$stream)
              }
              $32.strength=
                readFixed8($bytes,$stream)
              $32.innerShadow=
                readUb($bytes,$stream,1)
              $32.knockout=
                readUb($bytes,$stream,1)
              $32.compositeSource=
                readUb($bytes,$stream,1)
              if(type===3){

                $32.onTop=
                  readUb($bytes,$stream,1)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,1)
              }
              if(type===4||type===7){

                $32.passes=
                  readUb($bytes,$stream,4)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,4)
              }
              break
            case 5:

              $32.columns=
                readUi8($bytes,$stream)
              $32.rows=
                readUi8($bytes,$stream)
              $32.divisor=
                readFloat($bytes,$stream)
              $32.bias=
                readFloat($bytes,$stream)
              var $45=
                $32.weights=
                []
              var $46=columns*rows
              while($46--){
                $45.push(
                  readFloat($bytes,$stream)
                )}
              var $47=$32.defaultColor={}
              $47.red=
                readUi8($bytes,$stream)
              $47.green=
                readUi8($bytes,$stream)
              $47.blue=
                readUi8($bytes,$stream)
              $47.alpha=
                readUi8($bytes,$stream)
              var reserved=
                readUb($bytes,$stream,6)
              $32.clamp=
                readUb($bytes,$stream,1)
              $32.preserveAlpha=
                readUb($bytes,$stream,1)
              break
            case 6:

              var $48=
                $32.matrix=
                []
              var $49=20
              while($49--){
                $48.push(
                  readFloat($bytes,$stream)
                )}
              break
            case 7:

              if(type===4||type===7){
                var count=
                  readUi8($bytes,$stream)
              }
              else{
                var count=
                  1
              }
              var $50=
                $32.colors=
                []
              var $51=count
              while($51--){
                var $52={}
                $52.red=
                  readUi8($bytes,$stream)
                $52.green=
                  readUi8($bytes,$stream)
                $52.blue=
                  readUi8($bytes,$stream)
                $52.alpha=
                  readUi8($bytes,$stream)
                $50.push($52)}
              if(type===3){
                var $53=$32.higlightColor={}
                $53.red=
                  readUi8($bytes,$stream)
                $53.green=
                  readUi8($bytes,$stream)
                $53.blue=
                  readUi8($bytes,$stream)
                $53.alpha=
                  readUi8($bytes,$stream)
              }
              if(type===4||type===7){

                var $54=
                  $32.ratios=
                  []
                var $55=count
                while($55--){
                  $54.push(
                    readUi8($bytes,$stream)
                  )}
              }
              $32.blurX=
                readFixed($bytes,$stream)
              $32.blurY=
                readFixed($bytes,$stream)
              if(type!==2){

                $32.angle=
                  readFixed($bytes,$stream)
                $32.distance=
                  readFixed($bytes,$stream)
              }
              $32.strength=
                readFixed8($bytes,$stream)
              $32.innerShadow=
                readUb($bytes,$stream,1)
              $32.knockout=
                readUb($bytes,$stream,1)
              $32.compositeSource=
                readUb($bytes,$stream,1)
              if(type===3){

                $32.onTop=
                  readUb($bytes,$stream,1)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,1)
              }
              if(type===4||type===7){

                $32.passes=
                  readUb($bytes,$stream,4)
              }
              else{

                var reserved=
                  readUb($bytes,$stream,4)
              }
              break
            default:
            }
          }
          if(blend){
            $29.blendMode=
              readUi8($bytes,$stream)
          }
        }
        $28.push($29)}
      while(!eob)
      if(!!actionOffset){

        var $56=
          $.buttonActions=
          []
        do{
          var $57={}
          var buttonCondSize=
            readUi16($bytes,$stream)
          var buttonConditions=
            readUi16($bytes,$stream)
          $57.idleToOverDown=
            buttonConditions>>7&1
          $57.outDownToIdle=
            buttonConditions>>6&1
          $57.outDownToOverDown=
            buttonConditions>>5&1
          $57.overDownToOutDown=
            buttonConditions>>4&1
          $57.overDownToOverUp=
            buttonConditions>>3&1
          $57.overUpToOverDown=
            buttonConditions>>2&1
          $57.overUpToIdle=
            buttonConditions>>1&1
          $57.idleToOverUp=
            buttonConditions&1
          $57.mouseEventFlags=
            buttonConditions&511
          $57.keyPress=
            buttonConditions>>9&127
          $57.overDownToIdle=
            buttonConditions>>8&1
          if(!buttonCondSize){
            $57.actionsData=
              readBinary($bytes,$stream,0)
          }
          else{
            $57.actionsData=
              readBinary($bytes,$stream,buttonCondSize - 4)
          }
          $56.push($57)}
        while($stream.remaining() > 0)
      }
    }
    return $
  }

  function defineJPEGTables($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.id=
      0
    $.imgData=
      readBinary($bytes,$stream,0)
    $.mimeType=
      "application/octet-stream"
    return $
  }

  function setBackgroundColor($bytes,$stream,$,swfVersion,tagCode) {
    $||($={})
    var $0 = $.color={}
    $0.red=
      readUi8($bytes,$stream)
    $0.green=
      readUi8($bytes,$stream)
    $0.blue=
      readUi8($bytes,$stream)
    $0.alpha=
      255
    return $
  }

  function defineFont($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.id=
      readUi16($bytes,$stream)
    var firstOffset=
      readUi16($bytes,$stream)
    var glyphCount=
      $.glyphCount=
      firstOffset/2
    var restOffsets=
      []
    var $0=glyphCount-1
    while($0--){
      restOffsets.push(
        readUi16($bytes,$stream)
      )}
    $.offsets=
      [firstOffset].concat(restOffsets)
    var $1=
      $.glyphs=
      []
    var $2=glyphCount
    while($2--){
      var $3={}

      align($bytes,$stream)
      var fillBits=
        readUb($bytes,$stream,4)
      var lineBits=
        readUb($bytes,$stream,4)
      var $4=
        $3.records=
        []
      do{
        var $5={}
        var type=
          $5.type=
          readUb($bytes,$stream,1)
        var flags=
          readUb($bytes,$stream,5)
        var eos=
          $5.eos=
          !(type||flags)
        if(type){

          var isStraight=
            $5.isStraight=
            flags>>4
          var tmp=
            flags&0x0f
          var bits=
            tmp+2
          if(isStraight){

            var isGeneral=
              $5.isGeneral=
              readUb($bytes,$stream,1)
            if(isGeneral){

              $5.deltaX=
                readSb($bytes,$stream,bits)
              $5.deltaY=
                readSb($bytes,$stream,bits)
            }
            else{

              var isVertical=
                $5.isVertical=
                readUb($bytes,$stream,1)
              if(isVertical){

                $5.deltaY=
                  readSb($bytes,$stream,bits)
              }
              else{

                $5.deltaX=
                  readSb($bytes,$stream,bits)
              }
            }
          }
          else{

            $5.controlDeltaX=
              readSb($bytes,$stream,bits)
            $5.controlDeltaY=
              readSb($bytes,$stream,bits)
            $5.anchorDeltaX=
              readSb($bytes,$stream,bits)
            $5.anchorDeltaY=
              readSb($bytes,$stream,bits)
          }
        }
        else{

          if(tagCode>2){
            var hasNewStyles=$5.hasNewStyles=
              flags>>4
          }
          else{
            var hasNewStyles=$5.hasNewStyles=
              0
          }
          var hasLineStyle=
            $5.hasLineStyle=
            flags>>3&1
          var hasFillStyle1=
            $5.hasFillStyle1=
            flags>>2&1
          var hasFillStyle0=
            $5.hasFillStyle0=
            flags>>1&1
          var move=
            $5.move=
            flags&1
          if(move){

            var bits=
              readUb($bytes,$stream,5)
            $5.moveX=
              readSb($bytes,$stream,bits)
            $5.moveY=
              readSb($bytes,$stream,bits)
          }
          if(hasFillStyle0){
            $5.fillStyle0=
              readUb($bytes,$stream,fillBits)
          }
          if(hasFillStyle1){
            $5.fillStyle1=
              readUb($bytes,$stream,fillBits)
          }
          if(hasLineStyle){
            $5.lineStyle=
              readUb($bytes,$stream,lineBits)
          }
          if(hasNewStyles){


            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $6=
              $5.fillStyles=
              []
            var $7=count
            while($7--){
              var $8={}
              var type=
                $8.type=
                readUi8($bytes,$stream)
              switch(type){
              case 0:

                if(tagCode>22||isMorph){
                  var $9=$8.color={}
                  $9.red=
                    readUi8($bytes,$stream)
                  $9.green=
                    readUi8($bytes,$stream)
                  $9.blue=
                    readUi8($bytes,$stream)
                  $9.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $10=$8.color={}
                  $10.red=
                    readUi8($bytes,$stream)
                  $10.green=
                    readUi8($bytes,$stream)
                  $10.blue=
                    readUi8($bytes,$stream)
                  $10.alpha=
                    255
                }
                if(isMorph){
                  var $11=$8.colorMorph={}
                  $11.red=
                    readUi8($bytes,$stream)
                  $11.green=
                    readUi8($bytes,$stream)
                  $11.blue=
                    readUi8($bytes,$stream)
                  $11.alpha=
                    readUi8($bytes,$stream)
                }
                break
              case 16:
              case 18:
              case 19:

                var $12=$8.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $12.a=
                    readFb($bytes,$stream,bits)
                  $12.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $12.a=
                    1
                  $12.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $12.b=
                    readFb($bytes,$stream,bits)
                  $12.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $12.b=
                    0
                  $12.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $12.tx=
                  e/20
                $12.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $13=$8.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $13.a=
                      readFb($bytes,$stream,bits)
                    $13.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $13.a=
                      1
                    $13.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $13.b=
                      readFb($bytes,$stream,bits)
                    $13.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $13.b=
                      0
                    $13.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $13.tx=
                    e/20
                  $13.ty=
                    f/20
                  align($bytes,$stream)
                }

                if(tagCode===83){

                  $8.spreadMode=
                    readUb($bytes,$stream,2)
                  $8.interpolationMode=
                    readUb($bytes,$stream,2)
                }
                else{

                  var pad=
                    readUb($bytes,$stream,4)
                }
                var count=
                  $8.count=
                  readUb($bytes,$stream,4)
                var $14=
                  $8.records=
                  []
                var $15=count
                while($15--){
                  var $16={}
                  $16.ratio=
                    readUi8($bytes,$stream)
                  if(tagCode>22){
                    var $17=$16.color={}
                    $17.red=
                      readUi8($bytes,$stream)
                    $17.green=
                      readUi8($bytes,$stream)
                    $17.blue=
                      readUi8($bytes,$stream)
                    $17.alpha=
                      readUi8($bytes,$stream)
                  }
                  else{
                    var $18=$16.color={}
                    $18.red=
                      readUi8($bytes,$stream)
                    $18.green=
                      readUi8($bytes,$stream)
                    $18.blue=
                      readUi8($bytes,$stream)
                    $18.alpha=
                      255
                  }
                  if(isMorph){

                    $16.ratioMorph=
                      readUi8($bytes,$stream)
                    var $19=$16.colorMorph={}
                    $19.red=
                      readUi8($bytes,$stream)
                    $19.green=
                      readUi8($bytes,$stream)
                    $19.blue=
                      readUi8($bytes,$stream)
                    $19.alpha=
                      readUi8($bytes,$stream)
                  }
                  $14.push($16)}
                if(type===19){

                  $8.focalPoint=
                    readFixed8($bytes,$stream)
                  if(isMorph){
                    $8.focalPointMorph=
                      readFixed8($bytes,$stream)
                  }
                }
                break
              case 64:
              case 65:
              case 66:
              case 67:

                $8.bitmapId=
                  readUi16($bytes,$stream)
                var $20=$8.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $20.a=
                    readFb($bytes,$stream,bits)
                  $20.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $20.a=
                    1
                  $20.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $20.b=
                    readFb($bytes,$stream,bits)
                  $20.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $20.b=
                    0
                  $20.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $20.tx=
                  e/20
                $20.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $21=$8.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $21.a=
                      readFb($bytes,$stream,bits)
                    $21.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $21.a=
                      1
                    $21.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $21.b=
                      readFb($bytes,$stream,bits)
                    $21.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $21.b=
                      0
                    $21.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $21.tx=
                    e/20
                  $21.ty=
                    f/20
                  align($bytes,$stream)
                }
                $8.condition=
                  type===64||type===67
                break
              default:
              }
              $6.push($8)}

            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $22=
              $5.lineStyles=
              []
            var $23=count
            while($23--){
              var $24={}
              $24.width=
                readUi16($bytes,$stream)
              if(isMorph){
                $24.widthMorph=
                  readUi16($bytes,$stream)
              }
              if(hasStrokes){

                align($bytes,$stream)
                $24.startCapStyle=
                  readUb($bytes,$stream,2)
                var joinStyle=
                  $24.joinStyle=
                  readUb($bytes,$stream,2)
                var hasFill=
                  $24.hasFill=
                  readUb($bytes,$stream,1)
                $24.noHscale=
                  readUb($bytes,$stream,1)
                $24.noVscale=
                  readUb($bytes,$stream,1)
                $24.pixelHinting=
                  readUb($bytes,$stream,1)
                var reserved=
                  readUb($bytes,$stream,5)
                $24.noClose=
                  readUb($bytes,$stream,1)
                $24.endCapStyle=
                  readUb($bytes,$stream,2)
                if(joinStyle===2){
                  $24.miterLimitFactor=
                    readFixed8($bytes,$stream)
                }
                if(hasFill){

                  var $25=$24.fillStyle={}
                  var type=
                    $25.type=
                    readUi8($bytes,$stream)
                  switch(type){
                  case 0:

                    if(tagCode>22||isMorph){
                      var $26=$25.color={}
                      $26.red=
                        readUi8($bytes,$stream)
                      $26.green=
                        readUi8($bytes,$stream)
                      $26.blue=
                        readUi8($bytes,$stream)
                      $26.alpha=
                        readUi8($bytes,$stream)
                    }
                    else{
                      var $27=$25.color={}
                      $27.red=
                        readUi8($bytes,$stream)
                      $27.green=
                        readUi8($bytes,$stream)
                      $27.blue=
                        readUi8($bytes,$stream)
                      $27.alpha=
                        255
                    }
                    if(isMorph){
                      var $28=$25.colorMorph={}
                      $28.red=
                        readUi8($bytes,$stream)
                      $28.green=
                        readUi8($bytes,$stream)
                      $28.blue=
                        readUi8($bytes,$stream)
                      $28.alpha=
                        readUi8($bytes,$stream)
                    }
                    break
                  case 16:
                  case 18:
                  case 19:

                    var $29=$25.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $29.a=
                        readFb($bytes,$stream,bits)
                      $29.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $29.a=
                        1
                      $29.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $29.b=
                        readFb($bytes,$stream,bits)
                      $29.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $29.b=
                        0
                      $29.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $29.tx=
                      e/20
                    $29.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $30=$25.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $30.a=
                          readFb($bytes,$stream,bits)
                        $30.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $30.a=
                          1
                        $30.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $30.b=
                          readFb($bytes,$stream,bits)
                        $30.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $30.b=
                          0
                        $30.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $30.tx=
                        e/20
                      $30.ty=
                        f/20
                      align($bytes,$stream)
                    }

                    if(tagCode===83){

                      $25.spreadMode=
                        readUb($bytes,$stream,2)
                      $25.interpolationMode=
                        readUb($bytes,$stream,2)
                    }
                    else{

                      var pad=
                        readUb($bytes,$stream,4)
                    }
                    var count=
                      $25.count=
                      readUb($bytes,$stream,4)
                    var $31=
                      $25.records=
                      []
                    var $32=count
                    while($32--){
                      var $33={}
                      $33.ratio=
                        readUi8($bytes,$stream)
                      if(tagCode>22){
                        var $34=$33.color={}
                        $34.red=
                          readUi8($bytes,$stream)
                        $34.green=
                          readUi8($bytes,$stream)
                        $34.blue=
                          readUi8($bytes,$stream)
                        $34.alpha=
                          readUi8($bytes,$stream)
                      }
                      else{
                        var $35=$33.color={}
                        $35.red=
                          readUi8($bytes,$stream)
                        $35.green=
                          readUi8($bytes,$stream)
                        $35.blue=
                          readUi8($bytes,$stream)
                        $35.alpha=
                          255
                      }
                      if(isMorph){

                        $33.ratioMorph=
                          readUi8($bytes,$stream)
                        var $36=$33.colorMorph={}
                        $36.red=
                          readUi8($bytes,$stream)
                        $36.green=
                          readUi8($bytes,$stream)
                        $36.blue=
                          readUi8($bytes,$stream)
                        $36.alpha=
                          readUi8($bytes,$stream)
                      }
                      $31.push($33)}
                    if(type===19){

                      $25.focalPoint=
                        readFixed8($bytes,$stream)
                      if(isMorph){
                        $25.focalPointMorph=
                          readFixed8($bytes,$stream)
                      }
                    }
                    break
                  case 64:
                  case 65:
                  case 66:
                  case 67:

                    $25.bitmapId=
                      readUi16($bytes,$stream)
                    var $37=$25.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $37.a=
                        readFb($bytes,$stream,bits)
                      $37.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $37.a=
                        1
                      $37.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $37.b=
                        readFb($bytes,$stream,bits)
                      $37.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $37.b=
                        0
                      $37.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $37.tx=
                      e/20
                    $37.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $38=$25.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $38.a=
                          readFb($bytes,$stream,bits)
                        $38.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $38.a=
                          1
                        $38.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $38.b=
                          readFb($bytes,$stream,bits)
                        $38.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $38.b=
                          0
                        $38.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $38.tx=
                        e/20
                      $38.ty=
                        f/20
                      align($bytes,$stream)
                    }
                    $25.condition=
                      type===64||type===67
                    break
                  default:
                  }
                }
                else{

                  var $39=$24.color={}
                  $39.red=
                    readUi8($bytes,$stream)
                  $39.green=
                    readUi8($bytes,$stream)
                  $39.blue=
                    readUi8($bytes,$stream)
                  $39.alpha=
                    readUi8($bytes,$stream)
                  if(isMorph){
                    var $40=$24.colorMorph={}
                    $40.red=
                      readUi8($bytes,$stream)
                    $40.green=
                      readUi8($bytes,$stream)
                    $40.blue=
                      readUi8($bytes,$stream)
                    $40.alpha=
                      readUi8($bytes,$stream)
                  }
                }
              }
              else{

                if(tagCode>22){
                  var $41=$24.color={}
                  $41.red=
                    readUi8($bytes,$stream)
                  $41.green=
                    readUi8($bytes,$stream)
                  $41.blue=
                    readUi8($bytes,$stream)
                  $41.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $42=$24.color={}
                  $42.red=
                    readUi8($bytes,$stream)
                  $42.green=
                    readUi8($bytes,$stream)
                  $42.blue=
                    readUi8($bytes,$stream)
                  $42.alpha=
                    255
                }
                if(isMorph){
                  var $43=$24.colorMorph={}
                  $43.red=
                    readUi8($bytes,$stream)
                  $43.green=
                    readUi8($bytes,$stream)
                  $43.blue=
                    readUi8($bytes,$stream)
                  $43.alpha=
                    readUi8($bytes,$stream)
                }
              }
              $22.push($24)}

            align($bytes,$stream)
            var fillBits=
              readUb($bytes,$stream,4)
            var lineBits=
              readUb($bytes,$stream,4)
          }
        }
        $4.push($5)}
      while(!eos)
      $1.push($3)}
    return $
  }

  function defineLabel($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.id=
      readUi16($bytes,$stream)
    var $0=$.bbox={}
    bbox($bytes,$stream,$0);

    align($bytes,$stream)
    var $1=$.matrix={}
    align($bytes,$stream)
    var hasScale=
      readUb($bytes,$stream,1)
    if(hasScale){

      var bits=
        readUb($bytes,$stream,5)
      $1.a=
        readFb($bytes,$stream,bits)
      $1.d=
        readFb($bytes,$stream,bits)
    }
    else{

      $1.a=
        1
      $1.d=
        1
    }
    var hasRotate=
      readUb($bytes,$stream,1)
    if(hasRotate){

      var bits=
        readUb($bytes,$stream,5)
      $1.b=
        readFb($bytes,$stream,bits)
      $1.c=
        readFb($bytes,$stream,bits)
    }
    else{

      $1.b=
        0
      $1.c=
        0
    }
    var bits=
      readUb($bytes,$stream,5)
    var e=
      readSb($bytes,$stream,bits)
    var f=
      readSb($bytes,$stream,bits)
    $1.tx=
      e/20
    $1.ty=
      f/20
    align($bytes,$stream)
    var glyphBits=
      $.glyphBits=
      readUi8($bytes,$stream)
    var advanceBits=
      $.advanceBits=
      readUi8($bytes,$stream)
    var $2=
      $.records=
      []
    do{
      var $3={}
      align($bytes,$stream)
      var flags=
        readUb($bytes,$stream,8)
      var eot=
        $3.eot=
        !flags

      var hasFont=
        $3.hasFont=
        flags>>3&1
      var hasColor=
        $3.hasColor=
        flags>>2&1
      var hasMoveY=
        $3.hasMoveY=
        flags>>1&1
      var hasMoveX=
        $3.hasMoveX=
        flags&1
      if(hasFont){
        $3.fontId=
          readUi16($bytes,$stream)
      }
      if(hasColor){

        if(tagCode===33){
          var $4=$3.color={}
          $4.red=
            readUi8($bytes,$stream)
          $4.green=
            readUi8($bytes,$stream)
          $4.blue=
            readUi8($bytes,$stream)
          $4.alpha=
            readUi8($bytes,$stream)
        }
        else{
          var $5=$3.color={}
          $5.red=
            readUi8($bytes,$stream)
          $5.green=
            readUi8($bytes,$stream)
          $5.blue=
            readUi8($bytes,$stream)
          $5.alpha=
            255
        }
      }
      if(hasMoveX){
        $3.moveX=
          readSi16($bytes,$stream)
      }
      if(hasMoveY){
        $3.moveY=
          readSi16($bytes,$stream)
      }
      if(hasFont){
        $3.fontHeight=
          readUi16($bytes,$stream)
      }
      if(!eot){

        var tmp=
          readUi8($bytes,$stream)
        if(swfVersion>6){
          var glyphCount=$3.glyphCount=
            tmp
        }
        else{
          var glyphCount=$3.glyphCount=
            tmp&0x7f
        }
        var $6=
          $3.entries=
          []
        var $7=glyphCount
        while($7--){
          var $8={}
          $8.glyphIndex=
            readUb($bytes,$stream,glyphBits)
          $8.advance=
            readSb($bytes,$stream,advanceBits)
          $6.push($8)}
      }
      $2.push($3)}
    while(!eot)
    return $
  }

  function doAction($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    if(tagCode===59){
      $.spriteId=
        readUi16($bytes,$stream)
    }
    $.actionsData=
      readBinary($bytes,$stream,0)
    return $
  }

  function defineSound($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.id=
      readUi16($bytes,$stream)
    var soundFlags=
      readUi8($bytes,$stream)
    $.soundFormat=
      soundFlags>>4&15
    $.soundRate=
      soundFlags>>2&3
    $.soundSize=
      soundFlags>>1&1
    $.soundType=
      soundFlags&1
    $.samplesCount=
      readUi32($bytes,$stream)
    $.soundData=
      readBinary($bytes,$stream,0)
    return $
  }

  function startSound($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    if(tagCode == 15){
      $.soundId=
        readUi16($bytes,$stream)
    }
    if(tagCode == 89){
      $.soundClassName=
        readString($bytes,$stream,0)
    }
    var $0=$.soundInfo={}
    var reserved=
      readUb($bytes,$stream,2)
    $0.stop=
      readUb($bytes,$stream,1)
    $0.noMultiple=
      readUb($bytes,$stream,1)
    var hasEnvelope=
      $0.hasEnvelope=
      readUb($bytes,$stream,1)
    var hasLoops=
      $0.hasLoops=
      readUb($bytes,$stream,1)
    var hasOutPoint=
      $0.hasOutPoint=
      readUb($bytes,$stream,1)
    var hasInPoint=
      $0.hasInPoint=
      readUb($bytes,$stream,1)
    if(hasInPoint){
      $0.inPoint=
        readUi32($bytes,$stream)
    }
    if(hasOutPoint){
      $0.outPoint=
        readUi32($bytes,$stream)
    }
    if(hasLoops){
      $0.loopCount=
        readUi16($bytes,$stream)
    }
    if(hasEnvelope){

      var envelopeCount=
        $0.envelopeCount=
        readUi8($bytes,$stream)
      var $1=
        $0.envelopes=
        []
      var $2=envelopeCount
      while($2--){
        var $3={}
        $3.pos44=
          readUi32($bytes,$stream)
        $3.volumeLeft=
          readUi16($bytes,$stream)
        $3.volumeRight=
          readUi16($bytes,$stream)
        $1.push($3)}
    }
    return $
  }

  function soundStreamHead($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    var playbackFlags=
      readUi8($bytes,$stream)
    $.playbackRate=
      playbackFlags>>2&3
    $.playbackSize=
      playbackFlags>>1&1
    $.playbackType=
      playbackFlags&1
    var streamFlags=
      readUi8($bytes,$stream)
    var streamCompression=
      $.streamCompression=
      streamFlags>>4&15
    $.streamRate=
      streamFlags>>2&3
    $.streamSize=
      streamFlags>>1&1
    $.streamType=
      streamFlags&1
    $.samplesCount=
      readUi32($bytes,$stream)
    if(streamCompression == 2){
      $.latencySeek=
        readSi16($bytes,$stream)
    }
    return $
  }

  function soundStreamBlock($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.data=
      readBinary($bytes,$stream,0)
    return $
  }

  function defineBitmap($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.id=
      readUi16($bytes,$stream)
    var format=
      $.format=
      readUi8($bytes,$stream)
    $.width=
      readUi16($bytes,$stream)
    $.height=
      readUi16($bytes,$stream)
    $.hasAlpha=
      tagCode===36
    if(format===3){
      $.colorTableSize=
        readUi8($bytes,$stream)
    }
    $.bmpData=
      readBinary($bytes,$stream,0)
    return $
  }

  function defineText($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.id=
      readUi16($bytes,$stream)
    var $0=$.bbox={}
    bbox($bytes, $stream, $0)
    var flags=
      readUi16($bytes,$stream)
    var hasText=
      $.hasText=
      flags>>7&1
    $.wordWrap=
      flags>>6&1
    $.multiline=
      flags>>5&1
    $.password=
      flags>>4&1
    $.readonly=
      flags>>3&1
    var hasColor=
      $.hasColor=
      flags>>2&1
    var hasMaxLength=
      $.hasMaxLength=
      flags>>1&1
    var hasFont=
      $.hasFont=
      flags&1
    var hasFontClass=
      $.hasFontClass=
      flags>>15&1
    $.autoSize=
      flags>>14&1
    var hasLayout=
      $.hasLayout=
      flags>>13&1
    $.noSelect=
      flags>>12&1
    $.border=
      flags>>11&1
    $.wasStatic=
      flags>>10&1
    $.html=
      flags>>9&1
    $.useOutlines=
      flags>>8&1
    if(hasFont){
      $.fontId=
        readUi16($bytes,$stream)
    }
    if(hasFontClass){
      $.fontClass=
        readString($bytes,$stream,0)
    }
    if(hasFont){
      $.fontHeight=
        readUi16($bytes,$stream)
    }
    if(hasColor){
      var $1=$.color={}
      $1.red=
        readUi8($bytes,$stream)
      $1.green=
        readUi8($bytes,$stream)
      $1.blue=
        readUi8($bytes,$stream)
      $1.alpha=
        readUi8($bytes,$stream)
    }
    if(hasMaxLength){
      $.maxLength=
        readUi16($bytes,$stream)
    }
    if(hasLayout){

      $.align=
        readUi8($bytes,$stream)
      $.leftMargin=
        readUi16($bytes,$stream)
      $.rightMargin=
        readUi16($bytes,$stream)
      $.indent=
        readSi16($bytes,$stream)
      $.leading=
        readSi16($bytes,$stream)
    }
    $.variableName=
      readString($bytes,$stream,0)
    if(hasText){
      $.initialText=
        readString($bytes,$stream,0)
    }
    return $
  }

  function frameLabel($bytes,$stream,$,swfVersion,tagCode) {
    $||($={})
    $.name=
      readString($bytes,$stream,0)
    return $
  }

  function defineFont2($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.id=
      readUi16($bytes,$stream)
    var hasLayout=
      $.hasLayout=
      readUb($bytes,$stream,1)
    if(swfVersion>5){

      $.shiftJis=
        readUb($bytes,$stream,1)
    }
    else{

      var reserved=
        readUb($bytes,$stream,1)
    }
    $.smallText=
      readUb($bytes,$stream,1)
    $.ansi=
      readUb($bytes,$stream,1)
    var wideOffset=
      $.wideOffset=
      readUb($bytes,$stream,1)
    var wide=
      $.wide=
      readUb($bytes,$stream,1)
    $.italic=
      readUb($bytes,$stream,1)
    $.bold=
      readUb($bytes,$stream,1)
    if(swfVersion>5){

      $.language=
        readUi8($bytes,$stream)
    }
    else{

      var reserved=
        readUi8($bytes,$stream)
      $.language=
        0
    }
    var nameLength=
      readUi8($bytes,$stream)
    $.name=
      readString($bytes,$stream,nameLength)
    if(tagCode===75){
      $.resolution=
        20
    }
    var glyphCount=
      $.glyphCount=
      readUi16($bytes,$stream)
    if(wideOffset){

      var $0=
        $.offsets=
        []
      var $1=glyphCount
      while($1--){
        $0.push(
          readUi32($bytes,$stream)
        )}
      $.mapOffset=
        readUi32($bytes,$stream)
    }
    else{

      var $2=
        $.offsets=
        []
      var $3=glyphCount
      while($3--){
        $2.push(
          readUi16($bytes,$stream)
        )}
      $.mapOffset=
        readUi16($bytes,$stream)
    }
    var $4=
      $.glyphs=
      []
    var $5=glyphCount
    while($5--){
      var $6={}

      align($bytes,$stream)
      var fillBits=
        readUb($bytes,$stream,4)
      var lineBits=
        readUb($bytes,$stream,4)
      var $7=
        $6.records=
        []
      do{
        var $8={}
        var type=
          $8.type=
          readUb($bytes,$stream,1)
        var flags=
          readUb($bytes,$stream,5)
        var eos=
          $8.eos=
          !(type||flags)
        if(type){

          var isStraight=
            $8.isStraight=
            flags>>4
          var tmp=
            flags&0x0f
          var bits=
            tmp+2
          if(isStraight){

            var isGeneral=
              $8.isGeneral=
              readUb($bytes,$stream,1)
            if(isGeneral){

              $8.deltaX=
                readSb($bytes,$stream,bits)
              $8.deltaY=
                readSb($bytes,$stream,bits)
            }
            else{

              var isVertical=
                $8.isVertical=
                readUb($bytes,$stream,1)
              if(isVertical){

                $8.deltaY=
                  readSb($bytes,$stream,bits)
              }
              else{

                $8.deltaX=
                  readSb($bytes,$stream,bits)
              }
            }
          }
          else{

            $8.controlDeltaX=
              readSb($bytes,$stream,bits)
            $8.controlDeltaY=
              readSb($bytes,$stream,bits)
            $8.anchorDeltaX=
              readSb($bytes,$stream,bits)
            $8.anchorDeltaY=
              readSb($bytes,$stream,bits)
          }
        }
        else{

          if(tagCode>2){
            var hasNewStyles=$8.hasNewStyles=
              flags>>4
          }
          else{
            var hasNewStyles=$8.hasNewStyles=
              0
          }
          var hasLineStyle=
            $8.hasLineStyle=
            flags>>3&1
          var hasFillStyle1=
            $8.hasFillStyle1=
            flags>>2&1
          var hasFillStyle0=
            $8.hasFillStyle0=
            flags>>1&1
          var move=
            $8.move=
            flags&1
          if(move){

            var bits=
              readUb($bytes,$stream,5)
            $8.moveX=
              readSb($bytes,$stream,bits)
            $8.moveY=
              readSb($bytes,$stream,bits)
          }
          if(hasFillStyle0){
            $8.fillStyle0=
              readUb($bytes,$stream,fillBits)
          }
          if(hasFillStyle1){
            $8.fillStyle1=
              readUb($bytes,$stream,fillBits)
          }
          if(hasLineStyle){
            $8.lineStyle=
              readUb($bytes,$stream,lineBits)
          }
          if(hasNewStyles){


            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $9=
              $8.fillStyles=
              []
            var $10=count
            while($10--){
              var $11={}
              var type=
                $11.type=
                readUi8($bytes,$stream)
              switch(type){
              case 0:

                if(tagCode>22||isMorph){
                  var $12=$11.color={}
                  $12.red=
                    readUi8($bytes,$stream)
                  $12.green=
                    readUi8($bytes,$stream)
                  $12.blue=
                    readUi8($bytes,$stream)
                  $12.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $13=$11.color={}
                  $13.red=
                    readUi8($bytes,$stream)
                  $13.green=
                    readUi8($bytes,$stream)
                  $13.blue=
                    readUi8($bytes,$stream)
                  $13.alpha=
                    255
                }
                if(isMorph){
                  var $14=$11.colorMorph={}
                  $14.red=
                    readUi8($bytes,$stream)
                  $14.green=
                    readUi8($bytes,$stream)
                  $14.blue=
                    readUi8($bytes,$stream)
                  $14.alpha=
                    readUi8($bytes,$stream)
                }
                break
              case 16:
              case 18:
              case 19:

                var $15=$11.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $15.a=
                    readFb($bytes,$stream,bits)
                  $15.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $15.a=
                    1
                  $15.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $15.b=
                    readFb($bytes,$stream,bits)
                  $15.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $15.b=
                    0
                  $15.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $15.tx=
                  e/20
                $15.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $16=$11.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $16.a=
                      readFb($bytes,$stream,bits)
                    $16.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $16.a=
                      1
                    $16.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $16.b=
                      readFb($bytes,$stream,bits)
                    $16.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $16.b=
                      0
                    $16.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $16.tx=
                    e/20
                  $16.ty=
                    f/20
                  align($bytes,$stream)
                }

                if(tagCode===83){

                  $11.spreadMode=
                    readUb($bytes,$stream,2)
                  $11.interpolationMode=
                    readUb($bytes,$stream,2)
                }
                else{

                  var pad=
                    readUb($bytes,$stream,4)
                }
                var count=
                  $11.count=
                  readUb($bytes,$stream,4)
                var $17=
                  $11.records=
                  []
                var $18=count
                while($18--){
                  var $19={}
                  $19.ratio=
                    readUi8($bytes,$stream)
                  if(tagCode>22){
                    var $20=$19.color={}
                    $20.red=
                      readUi8($bytes,$stream)
                    $20.green=
                      readUi8($bytes,$stream)
                    $20.blue=
                      readUi8($bytes,$stream)
                    $20.alpha=
                      readUi8($bytes,$stream)
                  }
                  else{
                    var $21=$19.color={}
                    $21.red=
                      readUi8($bytes,$stream)
                    $21.green=
                      readUi8($bytes,$stream)
                    $21.blue=
                      readUi8($bytes,$stream)
                    $21.alpha=
                      255
                  }
                  if(isMorph){

                    $19.ratioMorph=
                      readUi8($bytes,$stream)
                    var $22=$19.colorMorph={}
                    $22.red=
                      readUi8($bytes,$stream)
                    $22.green=
                      readUi8($bytes,$stream)
                    $22.blue=
                      readUi8($bytes,$stream)
                    $22.alpha=
                      readUi8($bytes,$stream)
                  }
                  $17.push($19)}
                if(type===19){

                  $11.focalPoint=
                    readFixed8($bytes,$stream)
                  if(isMorph){
                    $11.focalPointMorph=
                      readFixed8($bytes,$stream)
                  }
                }
                break
              case 64:
              case 65:
              case 66:
              case 67:

                $11.bitmapId=
                  readUi16($bytes,$stream)
                var $23=$11.matrix={}
                align($bytes,$stream)
                var hasScale=
                  readUb($bytes,$stream,1)
                if(hasScale){

                  var bits=
                    readUb($bytes,$stream,5)
                  $23.a=
                    readFb($bytes,$stream,bits)
                  $23.d=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $23.a=
                    1
                  $23.d=
                    1
                }
                var hasRotate=
                  readUb($bytes,$stream,1)
                if(hasRotate){

                  var bits=
                    readUb($bytes,$stream,5)
                  $23.b=
                    readFb($bytes,$stream,bits)
                  $23.c=
                    readFb($bytes,$stream,bits)
                }
                else{

                  $23.b=
                    0
                  $23.c=
                    0
                }
                var bits=
                  readUb($bytes,$stream,5)
                var e=
                  readSb($bytes,$stream,bits)
                var f=
                  readSb($bytes,$stream,bits)
                $23.tx=
                  e/20
                $23.ty=
                  f/20
                align($bytes,$stream)
                if(isMorph){
                  var $24=$11.matrixMorph={}
                  align($bytes,$stream)
                  var hasScale=
                    readUb($bytes,$stream,1)
                  if(hasScale){

                    var bits=
                      readUb($bytes,$stream,5)
                    $24.a=
                      readFb($bytes,$stream,bits)
                    $24.d=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $24.a=
                      1
                    $24.d=
                      1
                  }
                  var hasRotate=
                    readUb($bytes,$stream,1)
                  if(hasRotate){

                    var bits=
                      readUb($bytes,$stream,5)
                    $24.b=
                      readFb($bytes,$stream,bits)
                    $24.c=
                      readFb($bytes,$stream,bits)
                  }
                  else{

                    $24.b=
                      0
                    $24.c=
                      0
                  }
                  var bits=
                    readUb($bytes,$stream,5)
                  var e=
                    readSb($bytes,$stream,bits)
                  var f=
                    readSb($bytes,$stream,bits)
                  $24.tx=
                    e/20
                  $24.ty=
                    f/20
                  align($bytes,$stream)
                }
                $11.condition=
                  type===64||type===67
                break
              default:
              }
              $9.push($11)}

            var tmp=
              readUi8($bytes,$stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes,$stream)
            }
            else{
              var count=
                tmp
            }
            var $25=
              $8.lineStyles=
              []
            var $26=count
            while($26--){
              var $27={}
              $27.width=
                readUi16($bytes,$stream)
              if(isMorph){
                $27.widthMorph=
                  readUi16($bytes,$stream)
              }
              if(hasStrokes){

                align($bytes,$stream)
                $27.startCapStyle=
                  readUb($bytes,$stream,2)
                var joinStyle=
                  $27.joinStyle=
                  readUb($bytes,$stream,2)
                var hasFill=
                  $27.hasFill=
                  readUb($bytes,$stream,1)
                $27.noHscale=
                  readUb($bytes,$stream,1)
                $27.noVscale=
                  readUb($bytes,$stream,1)
                $27.pixelHinting=
                  readUb($bytes,$stream,1)
                var reserved=
                  readUb($bytes,$stream,5)
                $27.noClose=
                  readUb($bytes,$stream,1)
                $27.endCapStyle=
                  readUb($bytes,$stream,2)
                if(joinStyle===2){
                  $27.miterLimitFactor=
                    readFixed8($bytes,$stream)
                }
                if(hasFill){

                  var $28=$27.fillStyle={}
                  var type=
                    $28.type=
                    readUi8($bytes,$stream)
                  switch(type){
                  case 0:

                    if(tagCode>22||isMorph){
                      var $29=$28.color={}
                      $29.red=
                        readUi8($bytes,$stream)
                      $29.green=
                        readUi8($bytes,$stream)
                      $29.blue=
                        readUi8($bytes,$stream)
                      $29.alpha=
                        readUi8($bytes,$stream)
                    }
                    else{
                      var $30=$28.color={}
                      $30.red=
                        readUi8($bytes,$stream)
                      $30.green=
                        readUi8($bytes,$stream)
                      $30.blue=
                        readUi8($bytes,$stream)
                      $30.alpha=
                        255
                    }
                    if(isMorph){
                      var $31=$28.colorMorph={}
                      $31.red=
                        readUi8($bytes,$stream)
                      $31.green=
                        readUi8($bytes,$stream)
                      $31.blue=
                        readUi8($bytes,$stream)
                      $31.alpha=
                        readUi8($bytes,$stream)
                    }
                    break
                  case 16:
                  case 18:
                  case 19:

                    var $32=$28.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $32.a=
                        readFb($bytes,$stream,bits)
                      $32.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $32.a=
                        1
                      $32.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $32.b=
                        readFb($bytes,$stream,bits)
                      $32.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $32.b=
                        0
                      $32.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $32.tx=
                      e/20
                    $32.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $33=$28.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $33.a=
                          readFb($bytes,$stream,bits)
                        $33.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $33.a=
                          1
                        $33.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $33.b=
                          readFb($bytes,$stream,bits)
                        $33.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $33.b=
                          0
                        $33.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $33.tx=
                        e/20
                      $33.ty=
                        f/20
                      align($bytes,$stream)
                    }

                    if(tagCode===83){

                      $28.spreadMode=
                        readUb($bytes,$stream,2)
                      $28.interpolationMode=
                        readUb($bytes,$stream,2)
                    }
                    else{

                      var pad=
                        readUb($bytes,$stream,4)
                    }
                    var count=
                      $28.count=
                      readUb($bytes,$stream,4)
                    var $34=
                      $28.records=
                      []
                    var $35=count
                    while($35--){
                      var $36={}
                      $36.ratio=
                        readUi8($bytes,$stream)
                      if(tagCode>22){
                        var $37=$36.color={}
                        $37.red=
                          readUi8($bytes,$stream)
                        $37.green=
                          readUi8($bytes,$stream)
                        $37.blue=
                          readUi8($bytes,$stream)
                        $37.alpha=
                          readUi8($bytes,$stream)
                      }
                      else{
                        var $38=$36.color={}
                        $38.red=
                          readUi8($bytes,$stream)
                        $38.green=
                          readUi8($bytes,$stream)
                        $38.blue=
                          readUi8($bytes,$stream)
                        $38.alpha=
                          255
                      }
                      if(isMorph){

                        $36.ratioMorph=
                          readUi8($bytes,$stream)
                        var $39=$36.colorMorph={}
                        $39.red=
                          readUi8($bytes,$stream)
                        $39.green=
                          readUi8($bytes,$stream)
                        $39.blue=
                          readUi8($bytes,$stream)
                        $39.alpha=
                          readUi8($bytes,$stream)
                      }
                      $34.push($36)}
                    if(type===19){

                      $28.focalPoint=
                        readFixed8($bytes,$stream)
                      if(isMorph){
                        $28.focalPointMorph=
                          readFixed8($bytes,$stream)
                      }
                    }
                    break
                  case 64:
                  case 65:
                  case 66:
                  case 67:

                    $28.bitmapId=
                      readUi16($bytes,$stream)
                    var $40=$28.matrix={}
                    align($bytes,$stream)
                    var hasScale=
                      readUb($bytes,$stream,1)
                    if(hasScale){

                      var bits=
                        readUb($bytes,$stream,5)
                      $40.a=
                        readFb($bytes,$stream,bits)
                      $40.d=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $40.a=
                        1
                      $40.d=
                        1
                    }
                    var hasRotate=
                      readUb($bytes,$stream,1)
                    if(hasRotate){

                      var bits=
                        readUb($bytes,$stream,5)
                      $40.b=
                        readFb($bytes,$stream,bits)
                      $40.c=
                        readFb($bytes,$stream,bits)
                    }
                    else{

                      $40.b=
                        0
                      $40.c=
                        0
                    }
                    var bits=
                      readUb($bytes,$stream,5)
                    var e=
                      readSb($bytes,$stream,bits)
                    var f=
                      readSb($bytes,$stream,bits)
                    $40.tx=
                      e/20
                    $40.ty=
                      f/20
                    align($bytes,$stream)
                    if(isMorph){
                      var $41=$28.matrixMorph={}
                      align($bytes,$stream)
                      var hasScale=
                        readUb($bytes,$stream,1)
                      if(hasScale){

                        var bits=
                          readUb($bytes,$stream,5)
                        $41.a=
                          readFb($bytes,$stream,bits)
                        $41.d=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $41.a=
                          1
                        $41.d=
                          1
                      }
                      var hasRotate=
                        readUb($bytes,$stream,1)
                      if(hasRotate){

                        var bits=
                          readUb($bytes,$stream,5)
                        $41.b=
                          readFb($bytes,$stream,bits)
                        $41.c=
                          readFb($bytes,$stream,bits)
                      }
                      else{

                        $41.b=
                          0
                        $41.c=
                          0
                      }
                      var bits=
                        readUb($bytes,$stream,5)
                      var e=
                        readSb($bytes,$stream,bits)
                      var f=
                        readSb($bytes,$stream,bits)
                      $41.tx=
                        e/20
                      $41.ty=
                        f/20
                      align($bytes,$stream)
                    }
                    $28.condition=
                      type===64||type===67
                    break
                  default:
                  }
                }
                else{

                  var $42=$27.color={}
                  $42.red=
                    readUi8($bytes,$stream)
                  $42.green=
                    readUi8($bytes,$stream)
                  $42.blue=
                    readUi8($bytes,$stream)
                  $42.alpha=
                    readUi8($bytes,$stream)
                  if(isMorph){
                    var $43=$27.colorMorph={}
                    $43.red=
                      readUi8($bytes,$stream)
                    $43.green=
                      readUi8($bytes,$stream)
                    $43.blue=
                      readUi8($bytes,$stream)
                    $43.alpha=
                      readUi8($bytes,$stream)
                  }
                }
              }
              else{

                if(tagCode>22){
                  var $44=$27.color={}
                  $44.red=
                    readUi8($bytes,$stream)
                  $44.green=
                    readUi8($bytes,$stream)
                  $44.blue=
                    readUi8($bytes,$stream)
                  $44.alpha=
                    readUi8($bytes,$stream)
                }
                else{
                  var $45=$27.color={}
                  $45.red=
                    readUi8($bytes,$stream)
                  $45.green=
                    readUi8($bytes,$stream)
                  $45.blue=
                    readUi8($bytes,$stream)
                  $45.alpha=
                    255
                }
                if(isMorph){
                  var $46=$27.colorMorph={}
                  $46.red=
                    readUi8($bytes,$stream)
                  $46.green=
                    readUi8($bytes,$stream)
                  $46.blue=
                    readUi8($bytes,$stream)
                  $46.alpha=
                    readUi8($bytes,$stream)
                }
              }
              $25.push($27)}

            align($bytes,$stream)
            var fillBits=
              readUb($bytes,$stream,4)
            var lineBits=
              readUb($bytes,$stream,4)
          }
        }
        $7.push($8)}
      while(!eos)
      $4.push($6)}
    if(wide){

      var $47=
        $.codes=
        []
      var $48=glyphCount
      while($48--){
        $47.push(
          readUi16($bytes,$stream)
        )}
    }
    else{

      var $49=
        $.codes=
        []
      var $50=glyphCount
      while($50--){
        $49.push(
          readUi8($bytes,$stream)
        )}
    }
    if(hasLayout){

      $.ascent=
        readUi16($bytes,$stream)
      $.descent=
        readUi16($bytes,$stream)
      $.leading=
        readSi16($bytes,$stream)
      var $51=
        $.advance=
        []
      var $52=glyphCount
      while($52--){
        $51.push(
          readSi16($bytes,$stream)
        )}
      var $53=
        $.bbox=
        []
      var $54=glyphCount
      while($54--){
        var $55={}
        bbox($bytes, $stream, $55);
        $53.push($55)}
      var kerningCount=
        readUi16($bytes,$stream)
      var $56=
        $.kerning=
        []
      var $57=kerningCount
      while($57--){
        var $58={}
        if(wide){

          $58.code1=
            readUi16($bytes,$stream)
          $58.code2=
            readUi16($bytes,$stream)
        }
        else{

          $58.code1=
            readUi8($bytes,$stream)
          $58.code2=
            readUi8($bytes,$stream)
        }
        $58.adjustment=
          readUi16($bytes,$stream)
        $56.push($58)}
    }
    return $
  }

  function fileAttributes($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    var reserved=
      readUb($bytes,$stream,1)
    $.useDirectBlit=
      readUb($bytes,$stream,1)
    $.useGpu=
      readUb($bytes,$stream,1)
    $.hasMetadata=
      readUb($bytes,$stream,1)
    $.doAbc=
      readUb($bytes,$stream,1)
    $.noCrossDomainCaching=
      readUb($bytes,$stream,1)
    $.relativeUrls=
      readUb($bytes,$stream,1)
    $.network=
      readUb($bytes,$stream,1)
    var pad=
      readUb($bytes,$stream,24)
    return $
  }

  function doABC($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    if(tagCode===82){
      $.flags=
        readUi32($bytes,$stream)
    }
    else{
      $.flags=
        0
    }
    if(tagCode===82){
      $.name=
        readString($bytes,$stream,0)
    }
    else{
      $.name=
        ""
    }
    $.data=
      readBinary($bytes,$stream,0)
    return $
  }

  function symbolClass($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    var symbolCount=
      readUi16($bytes,$stream)
    var $0=
      $.exports=
      []
    var $1=symbolCount
    while($1--){
      var $2={}
      $2.symbolId=
        readUi16($bytes,$stream)
      $2.className=
        readString($bytes,$stream,0)
      $0.push($2)}
    return $
  }

  function defineScalingGrid($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    $.symbolId=
      readUi16($bytes,$stream)
    var $0=$.splitter={}
    bbox($bytes, $stream, $0)
    return $
  }

  function defineScene($bytes,$stream,$,swfVersion,tagCode){
    $||($={})
    var sceneCount=
      readEncodedU32($bytes,$stream)
    var $0=
      $.scenes=
      []
    var $1=sceneCount
    while($1--){
      var $2={}
      $2.offset=
        readEncodedU32($bytes,$stream)
      $2.name=
        readString($bytes,$stream,0)
      $0.push($2)}
    var labelCount=
      readEncodedU32($bytes,$stream)
    var $3=
      $.labels=
      []
    var $4=labelCount
    while($4--){
      var $5={}
      $5.frame=
        readEncodedU32($bytes,$stream)
      $5.name=
        readString($bytes,$stream,0)
      $3.push($5)}
    return $
  }

  function bbox($bytes, $stream, $) {
    align($bytes,$stream)
    var bits=
      readUb($bytes,$stream,5)
    var xMin=
      readSb($bytes,$stream,bits)
    var xMax=
      readSb($bytes,$stream,bits)
    var yMin=
      readSb($bytes,$stream,bits)
    var yMax=
      readSb($bytes,$stream,bits)
    $.left=
      xMin/20
    $.right=
      xMax/20
    $.top=
      yMin/20
    $.bottom=
      yMax/20
    align($bytes,$stream)
  }

})();

var readHeader = function ($bytes,$stream,$){
  $||($={})
  var $0=$.bbox={}
  align($bytes,$stream)
  var bits=
    readUb($bytes,$stream,5)
  var xMin=
    readSb($bytes,$stream,bits)
  var xMax=
    readSb($bytes,$stream,bits)
  var yMin=
    readSb($bytes,$stream,bits)
  var yMax=
    readSb($bytes,$stream,bits)
  $0.left=
    xMin/20
  $0.right=
    xMax/20
  $0.top=
    yMin/20
  $0.bottom=
    yMax/20
  align($bytes,$stream)
  var reserved=
    readUi8($bytes,$stream)
  $.frameRate=
    readUi8($bytes,$stream)
  $.frameCount=
    readUi16($bytes,$stream)
  return $
};
