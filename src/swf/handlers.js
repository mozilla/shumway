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

function trace (str) {
  if (this.print) {
    print(str);
  }
}

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
  };

  function defineShape($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var $0 = $.bbox = {};
    bbox($bytes, $stream, $0, swfVersion, tagCode);
    var isMorph = $.isMorph = tagCode === 46 || tagCode === 84;
    if (isMorph) {
      var $1 = $.bboxMorph = {};
      bbox($bytes, $stream, $1, swfVersion, tagCode);
    }
    var hasStrokes = $.hasStrokes = tagCode === 83 || tagCode === 84;
    if (hasStrokes) {
      var $2 = $.strokeBbox = {};
      bbox($bytes, $stream, $2, swfVersion, tagCode);
      if (isMorph) {
        var $3 = $.strokeBboxMorph = {};
        bbox($bytes, $stream, $3, swfVersion, tagCode);
      }
      var reserved = readUb($bytes, $stream, 5);
      $.fillWinding = readUb($bytes, $stream, 1);
      $.nonScalingStrokes = readUb($bytes, $stream, 1);
      $.scalingStrokes = readUb($bytes, $stream, 1);
    }
    if (isMorph) {
      $.offsetMorph = readUi32($bytes, $stream);
      morphShapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    } else {
      shapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    }
    return $
  }

  function placeObject($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    if(tagCode>4){

      if(tagCode>26){
        var flags=
          readUi16($bytes, $stream)
      }
      else{
        var flags=
          readUi8($bytes, $stream)
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
        readUi16($bytes, $stream)
      if(hasClassName){
        $.className=
          readString($bytes, $stream, 0)
      }
      if(place){
        $.symbolId=
          readUi16($bytes, $stream)
      }
      if(hasMatrix){
        var $0=$.matrix={}
        matrix($bytes, $stream, $0, swfVersion, tagCode);
      }
      if(hasCxform){
        var $1=$.cxform={}
        cxform($bytes, $stream, $1, swfVersion, tagCode);
      }
      if(hasRatio){
        $.ratio=
          readUi16($bytes, $stream)
      }
      if(hasName){
        $.name=
          readString($bytes, $stream, 0)
      }
      if(clip){
        $.clipDepth=
          readUi16($bytes, $stream)
      }
      if(hasFilters){

        var count=
          readUi8($bytes, $stream)
        var $2=
          $.filters=
          []
        var $3=count
        while ($3--) {
          var $4={}
          anyFilter($bytes, $stream, $4, swfVersion, tagCode);
          $2.push($4)}
      }
      if(blend){
        $.blendMode=
          readUi8($bytes, $stream)
      }
      if(cache){
        $.bmpCache=
          readUi8($bytes, $stream)
      }
      if(hasEvents){

        var reserved=
          readUi16($bytes, $stream)
        if(swfVersion>=6){
          var allFlags=
            readUi32($bytes, $stream)
        }
        else{
          var allFlags=
            readUi16($bytes, $stream)
        }
        var $28=
          $.events=
          []
        do{
          var $29={}
          events($bytes, $stream, $29, swfVersion, tagCode);
          $28.push($29)}
        while(!eoe)
      }
      if(hasBackgroundColor){
        $.backgroundColor=
          argb($bytes, $stream, $126, swfVersion, tagCode);
      }
      if(hasVisibility){
        $.visibility=
          readUi8($bytes, $stream)
      }
    } else {

      $.place=
        1
      $.symbolId=
        readUi16($bytes, $stream)
      $.depth=
        readUi16($bytes, $stream)
      $.hasMatrix=
        1
      var $30=$.matrix={}
      matrix($bytes, $stream, $30, swfVersion, tagCode);
      if($stream.remaining()){
        $.hasCxform=
          1
        var $31=$.cxform={}
        cxform($bytes, $stream, $31, swfVersion, tagCode);
      }
    }
    return $
  }

  function removeObject($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    if(tagCode===5){
      $.symbolId=
        readUi16($bytes, $stream)
    }
    $.depth=
      readUi16($bytes, $stream)
    return $
  }

  function defineImage($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    if(tagCode>21){

      var alphaDataOffset=
        readUi32($bytes, $stream)
      if(tagCode===90){
        $.deblock=
          readFixed8($bytes, $stream)
      }
      var imgData=
        $.imgData=
        readBinary($bytes, $stream, alphaDataOffset)
      $.alphaData=
        readBinary($bytes, $stream, 0)
    }
    else{

      var imgData=
        $.imgData=
        readBinary($bytes, $stream, 0)
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

  function defineButton($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    if(tagCode==7){

      var $0=
        $.characters=
        []
      do{
        var $1={}
        var flags=
          readUi8($bytes, $stream)
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
            readUi16($bytes, $stream)
          $1.depth=
            readUi16($bytes, $stream)
          var $2=$1.matrix={}
          matrix($bytes, $stream, $2, swfVersion, tagCode);
          if(tagCode===34){
            var $3=$1.cxform={}
            cxform($bytes, $stream, $3, swfVersion, tagCode);
          }
          if(hasFilters){
            $1.filterCount=
              readUi8($bytes, $stream)
            var $4=$1.filters={}
            anyFilter($bytes, $stream, $4, swfVersion, tagCode);
          }
          if(blend){
            $1.blendMode=
              readUi8($bytes, $stream)
          }
        }
        $0.push($1)}
      while(!eob)
      $.actionsData=
        readBinary($bytes, $stream, 0)
    }
    else{

      var trackFlags=
        readUi8($bytes, $stream)
      $.trackAsMenu=
        trackFlags>>7&1
      var actionOffset=
        readUi16($bytes, $stream)
      var $28=
        $.characters=
        []
      do{
        var $29={}
        var flags=
          readUi8($bytes, $stream)
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
            readUi16($bytes, $stream)
          $29.depth=
            readUi16($bytes, $stream)
          var $30=$29.matrix={}
          matrix($bytes, $stream, $30, swfVersion, tagCode);
          if(tagCode===34){
            var $31=$29.cxform={}
            cxform($bytes, $stream, $31, swfVersion, tagCode);
          }
          if(hasFilters){

            $29.filterCount=
              readUi8($bytes, $stream)
            var $32=$29.filters={}
            var type=
              $32.type=
              readUi8($bytes, $stream)
            switch(type){
            case 0:

              if(type===4||type===7){
                var count=
                  readUi8($bytes, $stream)
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
                  readUi8($bytes, $stream)
                $35.green=
                  readUi8($bytes, $stream)
                $35.blue=
                  readUi8($bytes, $stream)
                $35.alpha=
                  readUi8($bytes, $stream)
                $33.push($35)}
              if(type===3){
                var $36=$32.higlightColor={}
                $36.red=
                  readUi8($bytes, $stream)
                $36.green=
                  readUi8($bytes, $stream)
                $36.blue=
                  readUi8($bytes, $stream)
                $36.alpha=
                  readUi8($bytes, $stream)
              }
              if(type===4||type===7){

                var $37=
                  $32.ratios=
                  []
                var $38=count
                while($38--){
                  $37.push(
                    readUi8($bytes, $stream)
                  )}
              }
              $32.blurX=
                readFixed($bytes, $stream)
              $32.blurY=
                readFixed($bytes, $stream)
              if(type!==2){

                $32.angle=
                  readFixed($bytes, $stream)
                $32.distance=
                  readFixed($bytes, $stream)
              }
              $32.strength=
                readFixed8($bytes, $stream)
              $32.innerShadow=
                readUb($bytes, $stream, 1)
              $32.knockout=
                readUb($bytes, $stream, 1)
              $32.compositeSource=
                readUb($bytes, $stream, 1)
              if(type===3){

                $32.onTop=
                  readUb($bytes, $stream, 1)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 1)
              }
              if(type===4||type===7){

                $32.passes=
                  readUb($bytes, $stream, 4)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 4)
              }
              break
            case 1:

              $32.blurX=
                readFixed($bytes, $stream)
              $32.blurY=
                readFixed($bytes, $stream)
              $32.passes=
                readUb($bytes, $stream, 5)
              var reserved=
                readUb($bytes, $stream, 3)
              break
            case 2:
            case 3:
            case 4:

              if(type===4||type===7){
                var count=
                  readUi8($bytes, $stream)
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
                  readUi8($bytes, $stream)
                $41.green=
                  readUi8($bytes, $stream)
                $41.blue=
                  readUi8($bytes, $stream)
                $41.alpha=
                  readUi8($bytes, $stream)
                $39.push($41)}
              if(type===3){
                var $42=$32.higlightColor={}
                $42.red=
                  readUi8($bytes, $stream)
                $42.green=
                  readUi8($bytes, $stream)
                $42.blue=
                  readUi8($bytes, $stream)
                $42.alpha=
                  readUi8($bytes, $stream)
              }
              if(type===4||type===7){

                var $43=
                  $32.ratios=
                  []
                var $44=count
                while($44--){
                  $43.push(
                    readUi8($bytes, $stream)
                  )}
              }
              $32.blurX=
                readFixed($bytes, $stream)
              $32.blurY=
                readFixed($bytes, $stream)
              if(type!==2){

                $32.angle=
                  readFixed($bytes, $stream)
                $32.distance=
                  readFixed($bytes, $stream)
              }
              $32.strength=
                readFixed8($bytes, $stream)
              $32.innerShadow=
                readUb($bytes, $stream, 1)
              $32.knockout=
                readUb($bytes, $stream, 1)
              $32.compositeSource=
                readUb($bytes, $stream, 1)
              if(type===3){

                $32.onTop=
                  readUb($bytes, $stream, 1)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 1)
              }
              if(type===4||type===7){

                $32.passes=
                  readUb($bytes, $stream, 4)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 4)
              }
              break
            case 5:

              $32.columns=
                readUi8($bytes, $stream)
              $32.rows=
                readUi8($bytes, $stream)
              $32.divisor=
                readFloat($bytes, $stream)
              $32.bias=
                readFloat($bytes, $stream)
              var $45=
                $32.weights=
                []
              var $46=columns*rows
              while($46--){
                $45.push(
                  readFloat($bytes, $stream)
                )}
              var $47=$32.defaultColor={}
              $47.red=
                readUi8($bytes, $stream)
              $47.green=
                readUi8($bytes, $stream)
              $47.blue=
                readUi8($bytes, $stream)
              $47.alpha=
                readUi8($bytes, $stream)
              var reserved=
                readUb($bytes, $stream, 6)
              $32.clamp=
                readUb($bytes, $stream, 1)
              $32.preserveAlpha=
                readUb($bytes, $stream, 1)
              break
            case 6:

              var $48=
                $32.matrix=
                []
              var $49=20
              while($49--){
                $48.push(
                  readFloat($bytes, $stream)
                )}
              break
            case 7:

              if(type===4||type===7){
                var count=
                  readUi8($bytes, $stream)
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
                  readUi8($bytes, $stream)
                $52.green=
                  readUi8($bytes, $stream)
                $52.blue=
                  readUi8($bytes, $stream)
                $52.alpha=
                  readUi8($bytes, $stream)
                $50.push($52)}
              if(type===3){
                var $53=$32.higlightColor={}
                $53.red=
                  readUi8($bytes, $stream)
                $53.green=
                  readUi8($bytes, $stream)
                $53.blue=
                  readUi8($bytes, $stream)
                $53.alpha=
                  readUi8($bytes, $stream)
              }
              if(type===4||type===7){

                var $54=
                  $32.ratios=
                  []
                var $55=count
                while($55--){
                  $54.push(
                    readUi8($bytes, $stream)
                  )}
              }
              $32.blurX=
                readFixed($bytes, $stream)
              $32.blurY=
                readFixed($bytes, $stream)
              if(type!==2){

                $32.angle=
                  readFixed($bytes, $stream)
                $32.distance=
                  readFixed($bytes, $stream)
              }
              $32.strength=
                readFixed8($bytes, $stream)
              $32.innerShadow=
                readUb($bytes, $stream, 1)
              $32.knockout=
                readUb($bytes, $stream, 1)
              $32.compositeSource=
                readUb($bytes, $stream, 1)
              if(type===3){

                $32.onTop=
                  readUb($bytes, $stream, 1)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 1)
              }
              if(type===4||type===7){

                $32.passes=
                  readUb($bytes, $stream, 4)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 4)
              }
              break
            default:
            }
          }
          if(blend){
            $29.blendMode=
              readUi8($bytes, $stream)
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
            readUi16($bytes, $stream)
          var buttonConditions=
            readUi16($bytes, $stream)
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
              readBinary($bytes, $stream, 0)
          }
          else{
            $57.actionsData=
              readBinary($bytes, $stream, buttonCondSize - 4)
          }
          $56.push($57)}
        while($stream.remaining() > 0)
      }
    }
    return $
  }

  function defineJPEGTables($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      0
    $.imgData=
      readBinary($bytes, $stream, 0)
    $.mimeType=
      "application/octet-stream"
    return $
  }

  function setBackgroundColor($bytes, $stream, $, swfVersion, tagCode) {
    $||($={})
    var $0 = $.color={}
    $0.red=
      readUi8($bytes, $stream)
    $0.green=
      readUi8($bytes, $stream)
    $0.blue=
      readUi8($bytes, $stream)
    $0.alpha=
      255
    return $
  }

  function defineFont($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var firstOffset=
      readUi16($bytes, $stream)
    var glyphCount=
      $.glyphCount=
      firstOffset/2
    var restOffsets=
      []
    var $0=glyphCount-1
    while($0--){
      restOffsets.push(
        readUi16($bytes, $stream)
      )}
    $.offsets=
      [firstOffset].concat(restOffsets)
    var $1=
      $.glyphs=
      []
    var $2=glyphCount
    while($2--){
      var $3={}

      // begin shape()
      align($bytes, $stream)
      var fillBits=
        readUb($bytes, $stream, 4)
      var lineBits=
        readUb($bytes, $stream, 4)
      var $4=
        $3.records=
        []
      do{
        var $5={}
        var type=
          $5.type=
          readUb($bytes, $stream, 1)
        var flags=
          readUb($bytes, $stream, 5)
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
              readUb($bytes, $stream, 1)
            if(isGeneral){

              $5.deltaX=
                readSb($bytes, $stream, bits)
              $5.deltaY=
                readSb($bytes, $stream, bits)
            }
            else{

              var isVertical=
                $5.isVertical=
                readUb($bytes, $stream, 1)
              if(isVertical){

                $5.deltaY=
                  readSb($bytes, $stream, bits)
              }
              else{

                $5.deltaX=
                  readSb($bytes, $stream, bits)
              }
            }
          }
          else{

            $5.controlDeltaX=
              readSb($bytes, $stream, bits)
            $5.controlDeltaY=
              readSb($bytes, $stream, bits)
            $5.anchorDeltaX=
              readSb($bytes, $stream, bits)
            $5.anchorDeltaY=
              readSb($bytes, $stream, bits)
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
              readUb($bytes, $stream, 5)
            $5.moveX=
              readSb($bytes, $stream, bits)
            $5.moveY=
              readSb($bytes, $stream, bits)
          }
          if(hasFillStyle0){
            $5.fillStyle0=
              readUb($bytes, $stream, fillBits)
          }
          if(hasFillStyle1){
            $5.fillStyle1=
              readUb($bytes, $stream, fillBits)
          }
          if(hasLineStyle){
            $5.lineStyle=
              readUb($bytes, $stream, lineBits)
          }
          if(hasNewStyles){


            var tmp=
              readUi8($bytes, $stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes, $stream)
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
                readUi8($bytes, $stream)
              switch(type){
              case 0:

                if(tagCode>22||isMorph){
                  var $9=$8.color={}
                  $9.red=
                    readUi8($bytes, $stream)
                  $9.green=
                    readUi8($bytes, $stream)
                  $9.blue=
                    readUi8($bytes, $stream)
                  $9.alpha=
                    readUi8($bytes, $stream)
                }
                else{
                  var $10=$8.color={}
                  $10.red=
                    readUi8($bytes, $stream)
                  $10.green=
                    readUi8($bytes, $stream)
                  $10.blue=
                    readUi8($bytes, $stream)
                  $10.alpha=
                    255
                }
                if(isMorph){
                  var $11=$8.colorMorph={}
                  $11.red=
                    readUi8($bytes, $stream)
                  $11.green=
                    readUi8($bytes, $stream)
                  $11.blue=
                    readUi8($bytes, $stream)
                  $11.alpha=
                    readUi8($bytes, $stream)
                }
                break
              case 16:
              case 18:
              case 19:

                var $12=$8.matrix={}
                matrix($bytes, $stream, $12, swfVersion, tagCode);
                if(isMorph){
                  var $13=$8.matrixMorph={}
                  matrix($bytes, $stream, $13, swfVersion, tagCode);
                }

                if(tagCode===83){

                  $8.spreadMode=
                    readUb($bytes, $stream, 2)
                  $8.interpolationMode=
                    readUb($bytes, $stream, 2)
                }
                else{

                  var pad=
                    readUb($bytes, $stream, 4)
                }
                var count=
                  $8.count=
                  readUb($bytes, $stream, 4)
                var $14=
                  $8.records=
                  []
                var $15=count
                while($15--){
                  var $16={}
                  $16.ratio=
                    readUi8($bytes, $stream)
                  if(tagCode>22){
                    var $17=$16.color={}
                    $17.red=
                      readUi8($bytes, $stream)
                    $17.green=
                      readUi8($bytes, $stream)
                    $17.blue=
                      readUi8($bytes, $stream)
                    $17.alpha=
                      readUi8($bytes, $stream)
                  }
                  else{
                    var $18=$16.color={}
                    $18.red=
                      readUi8($bytes, $stream)
                    $18.green=
                      readUi8($bytes, $stream)
                    $18.blue=
                      readUi8($bytes, $stream)
                    $18.alpha=
                      255
                  }
                  if(isMorph){

                    $16.ratioMorph=
                      readUi8($bytes, $stream)
                    var $19=$16.colorMorph={}
                    $19.red=
                      readUi8($bytes, $stream)
                    $19.green=
                      readUi8($bytes, $stream)
                    $19.blue=
                      readUi8($bytes, $stream)
                    $19.alpha=
                      readUi8($bytes, $stream)
                  }
                  $14.push($16)}
                if(type===19){

                  $8.focalPoint=
                    readFixed8($bytes, $stream)
                  if(isMorph){
                    $8.focalPointMorph=
                      readFixed8($bytes, $stream)
                  }
                }
                break
              case 64:
              case 65:
              case 66:
              case 67:

                $8.bitmapId=
                  readUi16($bytes, $stream)
                var $20=$8.matrix={}
                matrix($bytes, $stream, $20, swfVersion, tagCode);
                if(isMorph){
                  var $21=$8.matrixMorph={}
                  matrix($bytes, $stream, $21, swfVersion, tagCode);
                }
                $8.condition=
                  type===64||type===67
                break
              default:
              }
              $6.push($8)}

            var tmp=
              readUi8($bytes, $stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes, $stream)
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
                readUi16($bytes, $stream)
              if(isMorph){
                $24.widthMorph=
                  readUi16($bytes, $stream)
              }
              if($.hasStrokes){

                align($bytes, $stream)
                $24.startCapStyle=
                  readUb($bytes, $stream, 2)
                var joinStyle=
                  $24.joinStyle=
                  readUb($bytes, $stream, 2)
                var hasFill=
                  $24.hasFill=
                  readUb($bytes, $stream, 1)
                $24.noHscale=
                  readUb($bytes, $stream, 1)
                $24.noVscale=
                  readUb($bytes, $stream, 1)
                $24.pixelHinting=
                  readUb($bytes, $stream, 1)
                var reserved=
                  readUb($bytes, $stream, 5)
                $24.noClose=
                  readUb($bytes, $stream, 1)
                $24.endCapStyle=
                  readUb($bytes, $stream, 2)
                if(joinStyle===2){
                  $24.miterLimitFactor=
                    readFixed8($bytes, $stream)
                }
                if(hasFill){

                  var $25=$24.fillStyle={}
                  var type=
                    $25.type=
                    readUi8($bytes, $stream)
                  switch(type){
                  case 0:

                    if(tagCode>22||isMorph){
                      var $26=$25.color={}
                      $26.red=
                        readUi8($bytes, $stream)
                      $26.green=
                        readUi8($bytes, $stream)
                      $26.blue=
                        readUi8($bytes, $stream)
                      $26.alpha=
                        readUi8($bytes, $stream)
                    }
                    else{
                      var $27=$25.color={}
                      $27.red=
                        readUi8($bytes, $stream)
                      $27.green=
                        readUi8($bytes, $stream)
                      $27.blue=
                        readUi8($bytes, $stream)
                      $27.alpha=
                        255
                    }
                    if(isMorph){
                      var $28=$25.colorMorph={}
                      $28.red=
                        readUi8($bytes, $stream)
                      $28.green=
                        readUi8($bytes, $stream)
                      $28.blue=
                        readUi8($bytes, $stream)
                      $28.alpha=
                        readUi8($bytes, $stream)
                    }
                    break
                  case 16:
                  case 18:
                  case 19:

                    var $29=$25.matrix={}
                    matrix($bytes, $stream, $29, swfVersion, tagCode);
                    if(isMorph){
                      var $30=$25.matrixMorph={}
                      matrix($bytes, $stream, $30, swfVersion, tagCode);
                    }

                    if(tagCode===83){

                      $25.spreadMode=
                        readUb($bytes, $stream, 2)
                      $25.interpolationMode=
                        readUb($bytes, $stream, 2)
                    }
                    else{

                      var pad=
                        readUb($bytes, $stream, 4)
                    }
                    var count=
                      $25.count=
                      readUb($bytes, $stream, 4)
                    var $31=
                      $25.records=
                      []
                    var $32=count
                    while($32--){
                      var $33={}
                      $33.ratio=
                        readUi8($bytes, $stream)
                      if(tagCode>22){
                        var $34=$33.color={}
                        $34.red=
                          readUi8($bytes, $stream)
                        $34.green=
                          readUi8($bytes, $stream)
                        $34.blue=
                          readUi8($bytes, $stream)
                        $34.alpha=
                          readUi8($bytes, $stream)
                      }
                      else{
                        var $35=$33.color={}
                        $35.red=
                          readUi8($bytes, $stream)
                        $35.green=
                          readUi8($bytes, $stream)
                        $35.blue=
                          readUi8($bytes, $stream)
                        $35.alpha=
                          255
                      }
                      if(isMorph){

                        $33.ratioMorph=
                          readUi8($bytes, $stream)
                        var $36=$33.colorMorph={}
                        $36.red=
                          readUi8($bytes, $stream)
                        $36.green=
                          readUi8($bytes, $stream)
                        $36.blue=
                          readUi8($bytes, $stream)
                        $36.alpha=
                          readUi8($bytes, $stream)
                      }
                      $31.push($33)}
                    if(type===19){

                      $25.focalPoint=
                        readFixed8($bytes, $stream)
                      if(isMorph){
                        $25.focalPointMorph=
                          readFixed8($bytes, $stream)
                      }
                    }
                    break
                  case 64:
                  case 65:
                  case 66:
                  case 67:

                    $25.bitmapId=
                      readUi16($bytes, $stream)
                    var $37=$25.matrix={}
                    matrix($bytes, $stream, $37, swfVersion, tagCode);
                    if(isMorph){
                      var $38=$25.matrixMorph={}
                      matrix($bytes, $stream, $38, swfVersion, tagCode);
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
                    readUi8($bytes, $stream)
                  $39.green=
                    readUi8($bytes, $stream)
                  $39.blue=
                    readUi8($bytes, $stream)
                  $39.alpha=
                    readUi8($bytes, $stream)
                  if(isMorph){
                    var $40=$24.colorMorph={}
                    $40.red=
                      readUi8($bytes, $stream)
                    $40.green=
                      readUi8($bytes, $stream)
                    $40.blue=
                      readUi8($bytes, $stream)
                    $40.alpha=
                      readUi8($bytes, $stream)
                  }
                }
              }
              else{

                if(tagCode>22){
                  var $41=$24.color={}
                  $41.red=
                    readUi8($bytes, $stream)
                  $41.green=
                    readUi8($bytes, $stream)
                  $41.blue=
                    readUi8($bytes, $stream)
                  $41.alpha=
                    readUi8($bytes, $stream)
                }
                else{
                  var $42=$24.color={}
                  $42.red=
                    readUi8($bytes, $stream)
                  $42.green=
                    readUi8($bytes, $stream)
                  $42.blue=
                    readUi8($bytes, $stream)
                  $42.alpha=
                    255
                }
                if(isMorph){
                  var $43=$24.colorMorph={}
                  $43.red=
                    readUi8($bytes, $stream)
                  $43.green=
                    readUi8($bytes, $stream)
                  $43.blue=
                    readUi8($bytes, $stream)
                  $43.alpha=
                    readUi8($bytes, $stream)
                }
              }
              $22.push($24)}

            align($bytes, $stream)
            var fillBits=
              readUb($bytes, $stream, 4)
            var lineBits=
              readUb($bytes, $stream, 4)
          }
        }
        // end shape()
        $4.push($5)}
      while(!eos)
      $1.push($3)}
    return $
  }

  function defineLabel($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var $0=$.bbox={}
    bbox($bytes, $stream, $0, swfVersion, tagCode);

    align($bytes, $stream)
    var $1=$.matrix={}
    matrix($bytes, $stream, $1, swfVersion, tagCode);
    var glyphBits=
      $.glyphBits=
      readUi8($bytes, $stream)
    var advanceBits=
      $.advanceBits=
      readUi8($bytes, $stream)
    var $2=
      $.records=
      []
    do{
      var $3={}
      align($bytes, $stream)
      var flags=
        readUb($bytes, $stream, 8)
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
          readUi16($bytes, $stream)
      }
      if(hasColor){

        if(tagCode===33){
          var $4=$3.color={}
          $4.red=
            readUi8($bytes, $stream)
          $4.green=
            readUi8($bytes, $stream)
          $4.blue=
            readUi8($bytes, $stream)
          $4.alpha=
            readUi8($bytes, $stream)
        }
        else{
          var $5=$3.color={}
          $5.red=
            readUi8($bytes, $stream)
          $5.green=
            readUi8($bytes, $stream)
          $5.blue=
            readUi8($bytes, $stream)
          $5.alpha=
            255
        }
      }
      if(hasMoveX){
        $3.moveX=
          readSi16($bytes, $stream)
      }
      if(hasMoveY){
        $3.moveY=
          readSi16($bytes, $stream)
      }
      if(hasFont){
        $3.fontHeight=
          readUi16($bytes, $stream)
      }
      if(!eot){

        var tmp=
          readUi8($bytes, $stream)
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
            readUb($bytes, $stream, glyphBits)
          $8.advance=
            readSb($bytes, $stream, advanceBits)
          $6.push($8)}
      }
      $2.push($3)}
    while(!eot)
    return $
  }

  function doAction($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    if(tagCode===59){
      $.spriteId=
        readUi16($bytes, $stream)
    }
    $.actionsData=
      readBinary($bytes, $stream, 0)
    return $
  }

  function defineSound($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var soundFlags=
      readUi8($bytes, $stream)
    $.soundFormat=
      soundFlags>>4&15
    $.soundRate=
      soundFlags>>2&3
    $.soundSize=
      soundFlags>>1&1
    $.soundType=
      soundFlags&1
    $.samplesCount=
      readUi32($bytes, $stream)
    $.soundData=
      readBinary($bytes, $stream, 0)
    return $
  }

  function startSound($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    if(tagCode == 15){
      $.soundId=
        readUi16($bytes, $stream)
    }
    if(tagCode == 89){
      $.soundClassName=
        readString($bytes, $stream, 0)
    }
    var $0=$.soundInfo={}
    var reserved=
      readUb($bytes, $stream, 2)
    $0.stop=
      readUb($bytes, $stream, 1)
    $0.noMultiple=
      readUb($bytes, $stream, 1)
    var hasEnvelope=
      $0.hasEnvelope=
      readUb($bytes, $stream, 1)
    var hasLoops=
      $0.hasLoops=
      readUb($bytes, $stream, 1)
    var hasOutPoint=
      $0.hasOutPoint=
      readUb($bytes, $stream, 1)
    var hasInPoint=
      $0.hasInPoint=
      readUb($bytes, $stream, 1)
    if(hasInPoint){
      $0.inPoint=
        readUi32($bytes, $stream)
    }
    if(hasOutPoint){
      $0.outPoint=
        readUi32($bytes, $stream)
    }
    if(hasLoops){
      $0.loopCount=
        readUi16($bytes, $stream)
    }
    if(hasEnvelope){

      var envelopeCount=
        $0.envelopeCount=
        readUi8($bytes, $stream)
      var $1=
        $0.envelopes=
        []
      var $2=envelopeCount
      while($2--){
        var $3={}
        $3.pos44=
          readUi32($bytes, $stream)
        $3.volumeLeft=
          readUi16($bytes, $stream)
        $3.volumeRight=
          readUi16($bytes, $stream)
        $1.push($3)}
    }
    return $
  }

  function soundStreamHead($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    var playbackFlags=
      readUi8($bytes, $stream)
    $.playbackRate=
      playbackFlags>>2&3
    $.playbackSize=
      playbackFlags>>1&1
    $.playbackType=
      playbackFlags&1
    var streamFlags=
      readUi8($bytes, $stream)
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
      readUi32($bytes, $stream)
    if(streamCompression == 2){
      $.latencySeek=
        readSi16($bytes, $stream)
    }
    return $
  }

  function soundStreamBlock($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.data=
      readBinary($bytes, $stream, 0)
    return $
  }

  function defineBitmap($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var format=
      $.format=
      readUi8($bytes, $stream)
    $.width=
      readUi16($bytes, $stream)
    $.height=
      readUi16($bytes, $stream)
    $.hasAlpha=
      tagCode===36
    if(format===3){
      $.colorTableSize=
        readUi8($bytes, $stream)
    }
    $.bmpData=
      readBinary($bytes, $stream, 0)
    return $
  }

  function defineText($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var $0=$.bbox={}
    bbox($bytes, $stream, $0, swfVersion, tagCode)
    var flags=
      readUi16($bytes, $stream)
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
        readUi16($bytes, $stream)
    }
    if(hasFontClass){
      $.fontClass=
        readString($bytes, $stream, 0)
    }
    if(hasFont){
      $.fontHeight=
        readUi16($bytes, $stream)
    }
    if(hasColor){
      var $1=$.color={}
      $1.red=
        readUi8($bytes, $stream)
      $1.green=
        readUi8($bytes, $stream)
      $1.blue=
        readUi8($bytes, $stream)
      $1.alpha=
        readUi8($bytes, $stream)
    }
    if(hasMaxLength){
      $.maxLength=
        readUi16($bytes, $stream)
    }
    if(hasLayout){

      $.align=
        readUi8($bytes, $stream)
      $.leftMargin=
        readUi16($bytes, $stream)
      $.rightMargin=
        readUi16($bytes, $stream)
      $.indent=
        readSi16($bytes, $stream)
      $.leading=
        readSi16($bytes, $stream)
    }
    $.variableName=
      readString($bytes, $stream, 0)
    if(hasText){
      $.initialText=
        readString($bytes, $stream, 0)
    }
    return $
  }

  function frameLabel($bytes, $stream, $, swfVersion, tagCode) {
    $||($={})
    $.name=
      readString($bytes, $stream, 0)
    return $
  }

  function defineFont2($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var hasLayout=
      $.hasLayout=
      readUb($bytes, $stream, 1)
    if(swfVersion>5){

      $.shiftJis=
        readUb($bytes, $stream, 1)
    }
    else{

      var reserved=
        readUb($bytes, $stream, 1)
    }
    $.smallText=
      readUb($bytes, $stream, 1)
    $.ansi=
      readUb($bytes, $stream, 1)
    var wideOffset=
      $.wideOffset=
      readUb($bytes, $stream, 1)
    var wide=
      $.wide=
      readUb($bytes, $stream, 1)
    $.italic=
      readUb($bytes, $stream, 1)
    $.bold=
      readUb($bytes, $stream, 1)
    if(swfVersion>5){

      $.language=
        readUi8($bytes, $stream)
    }
    else{

      var reserved=
        readUi8($bytes, $stream)
      $.language=
        0
    }
    var nameLength=
      readUi8($bytes, $stream)
    $.name=
      readString($bytes, $stream, nameLength)
    if(tagCode===75){
      $.resolution=
        20
    }
    var glyphCount=
      $.glyphCount=
      readUi16($bytes, $stream)
    if(wideOffset){

      var $0=
        $.offsets=
        []
      var $1=glyphCount
      while($1--){
        $0.push(
          readUi32($bytes, $stream)
        )}
      $.mapOffset=
        readUi32($bytes, $stream)
    }
    else{

      var $2=
        $.offsets=
        []
      var $3=glyphCount
      while($3--){
        $2.push(
          readUi16($bytes, $stream)
        )}
      $.mapOffset=
        readUi16($bytes, $stream)
    }
    var $4=
      $.glyphs=
      []
    var $5=glyphCount
    while($5--){
      var $6={}

      align($bytes, $stream)
      var fillBits=
        readUb($bytes, $stream, 4)
      var lineBits=
        readUb($bytes, $stream, 4)
      var $7=
        $6.records=
        []
      do{
        var $8={}
        var type=
          $8.type=
          readUb($bytes, $stream, 1)
        var flags=
          readUb($bytes, $stream, 5)
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
              readUb($bytes, $stream, 1)
            if(isGeneral){

              $8.deltaX=
                readSb($bytes, $stream, bits)
              $8.deltaY=
                readSb($bytes, $stream, bits)
            }
            else{

              var isVertical=
                $8.isVertical=
                readUb($bytes, $stream, 1)
              if(isVertical){

                $8.deltaY=
                  readSb($bytes, $stream, bits)
              }
              else{

                $8.deltaX=
                  readSb($bytes, $stream, bits)
              }
            }
          }
          else{

            $8.controlDeltaX=
              readSb($bytes, $stream, bits)
            $8.controlDeltaY=
              readSb($bytes, $stream, bits)
            $8.anchorDeltaX=
              readSb($bytes, $stream, bits)
            $8.anchorDeltaY=
              readSb($bytes, $stream, bits)
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
              readUb($bytes, $stream, 5)
            $8.moveX=
              readSb($bytes, $stream, bits)
            $8.moveY=
              readSb($bytes, $stream, bits)
          }
          if(hasFillStyle0){
            $8.fillStyle0=
              readUb($bytes, $stream, fillBits)
          }
          if(hasFillStyle1){
            $8.fillStyle1=
              readUb($bytes, $stream, fillBits)
          }
          if(hasLineStyle){
            $8.lineStyle=
              readUb($bytes, $stream, lineBits)
          }
          if(hasNewStyles){
            var tmp=
              readUi8($bytes, $stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes, $stream)
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
                readUi8($bytes, $stream)
              switch(type){
              case 0:
                if(tagCode>22||isMorph){
                  var $12=$11.color={}
                  $12.red=
                    readUi8($bytes, $stream)
                  $12.green=
                    readUi8($bytes, $stream)
                  $12.blue=
                    readUi8($bytes, $stream)
                  $12.alpha=
                    readUi8($bytes, $stream)
                }
                else{
                  var $13=$11.color={}
                  $13.red=
                    readUi8($bytes, $stream)
                  $13.green=
                    readUi8($bytes, $stream)
                  $13.blue=
                    readUi8($bytes, $stream)
                  $13.alpha=
                    255
                }
                if(isMorph){
                  var $14=$11.colorMorph={}
                  $14.red=
                    readUi8($bytes, $stream)
                  $14.green=
                    readUi8($bytes, $stream)
                  $14.blue=
                    readUi8($bytes, $stream)
                  $14.alpha=
                    readUi8($bytes, $stream)
                }
                break
              case 16:
              case 18:
              case 19:

                var $15=$11.matrix={}
                matrix($bytes, $stream, $15, swfVersion, tagCode);
                if(isMorph){
                  var $16=$11.matrixMorph={}
                  matrix($bytes, $stream, $16, swfVersion, tagCode);
                }

                if(tagCode===83){

                  $11.spreadMode=
                    readUb($bytes, $stream, 2)
                  $11.interpolationMode=
                    readUb($bytes, $stream, 2)
                }
                else{

                  var pad=
                    readUb($bytes, $stream, 4)
                }
                var count=
                  $11.count=
                  readUb($bytes, $stream, 4)
                var $17=
                  $11.records=
                  []
                var $18=count
                while($18--){
                  var $19={}
                  $19.ratio=
                    readUi8($bytes, $stream)
                  if(tagCode>22){
                    var $20=$19.color={}
                    $20.red=
                      readUi8($bytes, $stream)
                    $20.green=
                      readUi8($bytes, $stream)
                    $20.blue=
                      readUi8($bytes, $stream)
                    $20.alpha=
                      readUi8($bytes, $stream)
                  }
                  else{
                    var $21=$19.color={}
                    $21.red=
                      readUi8($bytes, $stream)
                    $21.green=
                      readUi8($bytes, $stream)
                    $21.blue=
                      readUi8($bytes, $stream)
                    $21.alpha=
                      255
                  }
                  if(isMorph){

                    $19.ratioMorph=
                      readUi8($bytes, $stream)
                    var $22=$19.colorMorph={}
                    $22.red=
                      readUi8($bytes, $stream)
                    $22.green=
                      readUi8($bytes, $stream)
                    $22.blue=
                      readUi8($bytes, $stream)
                    $22.alpha=
                      readUi8($bytes, $stream)
                  }
                  $17.push($19)}
                if(type===19){

                  $11.focalPoint=
                    readFixed8($bytes, $stream)
                  if(isMorph){
                    $11.focalPointMorph=
                      readFixed8($bytes, $stream)
                  }
                }
                break
              case 64:
              case 65:
              case 66:
              case 67:

                $11.bitmapId=
                  readUi16($bytes, $stream)
                var $23=$11.matrix={}
                matrix($bytes, $stream, $23, swfVersion, tagCode);
                if(isMorph){
                  var $24=$11.matrixMorph={}
                  matrix($bytes, $stream, $24, swfVersion, tagCode);
                }
                $11.condition=
                  type===64||type===67
                break
              default:
              }
              $9.push($11)}

            var tmp=
              readUi8($bytes, $stream)
            if(tagCode>2&&tmp===255){
              var count=
                readUi16($bytes, $stream)
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
                readUi16($bytes, $stream)
              if(isMorph){
                $27.widthMorph=
                  readUi16($bytes, $stream)
              }
              if($.hasStrokes){

                align($bytes, $stream)
                $27.startCapStyle=
                  readUb($bytes, $stream, 2)
                var joinStyle=
                  $27.joinStyle=
                  readUb($bytes, $stream, 2)
                var hasFill=
                  $27.hasFill=
                  readUb($bytes, $stream, 1)
                $27.noHscale=
                  readUb($bytes, $stream, 1)
                $27.noVscale=
                  readUb($bytes, $stream, 1)
                $27.pixelHinting=
                  readUb($bytes, $stream, 1)
                var reserved=
                  readUb($bytes, $stream, 5)
                $27.noClose=
                  readUb($bytes, $stream, 1)
                $27.endCapStyle=
                  readUb($bytes, $stream, 2)
                if(joinStyle===2){
                  $27.miterLimitFactor=
                    readFixed8($bytes, $stream)
                }
                if(hasFill){

                  var $28=$27.fillStyle={}
                  var type=
                    $28.type=
                    readUi8($bytes, $stream)
                  switch(type){
                  case 0:

                    if(tagCode>22||isMorph){
                      var $29=$28.color={}
                      $29.red=
                        readUi8($bytes, $stream)
                      $29.green=
                        readUi8($bytes, $stream)
                      $29.blue=
                        readUi8($bytes, $stream)
                      $29.alpha=
                        readUi8($bytes, $stream)
                    }
                    else{
                      var $30=$28.color={}
                      $30.red=
                        readUi8($bytes, $stream)
                      $30.green=
                        readUi8($bytes, $stream)
                      $30.blue=
                        readUi8($bytes, $stream)
                      $30.alpha=
                        255
                    }
                    if(isMorph){
                      var $31=$28.colorMorph={}
                      $31.red=
                        readUi8($bytes, $stream)
                      $31.green=
                        readUi8($bytes, $stream)
                      $31.blue=
                        readUi8($bytes, $stream)
                      $31.alpha=
                        readUi8($bytes, $stream)
                    }
                    break
                  case 16:
                  case 18:
                  case 19:

                    var $32=$28.matrix={}
                    matrix($bytes, $stream, $32, swfVersion, tagCode);
                    if(isMorph){
                      var $33=$28.matrixMorph={}
                      matrix($bytes, $stream, $33, swfVersion, tagCode);
                    }

                    if(tagCode===83){

                      $28.spreadMode=
                        readUb($bytes, $stream, 2)
                      $28.interpolationMode=
                        readUb($bytes, $stream, 2)
                    }
                    else{

                      var pad=
                        readUb($bytes, $stream, 4)
                    }
                    var count=
                      $28.count=
                      readUb($bytes, $stream, 4)
                    var $34=
                      $28.records=
                      []
                    var $35=count
                    while($35--){
                      var $36={}
                      $36.ratio=
                        readUi8($bytes, $stream)
                      if(tagCode>22){
                        var $37=$36.color={}
                        $37.red=
                          readUi8($bytes, $stream)
                        $37.green=
                          readUi8($bytes, $stream)
                        $37.blue=
                          readUi8($bytes, $stream)
                        $37.alpha=
                          readUi8($bytes, $stream)
                      }
                      else{
                        var $38=$36.color={}
                        $38.red=
                          readUi8($bytes, $stream)
                        $38.green=
                          readUi8($bytes, $stream)
                        $38.blue=
                          readUi8($bytes, $stream)
                        $38.alpha=
                          255
                      }
                      if(isMorph){

                        $36.ratioMorph=
                          readUi8($bytes, $stream)
                        var $39=$36.colorMorph={}
                        $39.red=
                          readUi8($bytes, $stream)
                        $39.green=
                          readUi8($bytes, $stream)
                        $39.blue=
                          readUi8($bytes, $stream)
                        $39.alpha=
                          readUi8($bytes, $stream)
                      }
                      $34.push($36)}
                    if(type===19){

                      $28.focalPoint=
                        readFixed8($bytes, $stream)
                      if(isMorph){
                        $28.focalPointMorph=
                          readFixed8($bytes, $stream)
                      }
                    }
                    break
                  case 64:
                  case 65:
                  case 66:
                  case 67:

                    $28.bitmapId=
                      readUi16($bytes, $stream)
                    var $40=$28.matrix={}
                    matrix($bytes, $stream, $40, swfVersion, tagCode);
                    if(isMorph){
                      var $41=$28.matrixMorph={}
                      matrix($bytes, $stream, $41, swfVersion, tagCode);
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
                    readUi8($bytes, $stream)
                  $42.green=
                    readUi8($bytes, $stream)
                  $42.blue=
                    readUi8($bytes, $stream)
                  $42.alpha=
                    readUi8($bytes, $stream)
                  if(isMorph){
                    var $43=$27.colorMorph={}
                    $43.red=
                      readUi8($bytes, $stream)
                    $43.green=
                      readUi8($bytes, $stream)
                    $43.blue=
                      readUi8($bytes, $stream)
                    $43.alpha=
                      readUi8($bytes, $stream)
                  }
                }
              }
              else{

                if(tagCode>22){
                  var $44=$27.color={}
                  $44.red=
                    readUi8($bytes, $stream)
                  $44.green=
                    readUi8($bytes, $stream)
                  $44.blue=
                    readUi8($bytes, $stream)
                  $44.alpha=
                    readUi8($bytes, $stream)
                }
                else{
                  var $45=$27.color={}
                  $45.red=
                    readUi8($bytes, $stream)
                  $45.green=
                    readUi8($bytes, $stream)
                  $45.blue=
                    readUi8($bytes, $stream)
                  $45.alpha=
                    255
                }
                if(isMorph){
                  var $46=$27.colorMorph={}
                  $46.red=
                    readUi8($bytes, $stream)
                  $46.green=
                    readUi8($bytes, $stream)
                  $46.blue=
                    readUi8($bytes, $stream)
                  $46.alpha=
                    readUi8($bytes, $stream)
                }
              }
              $25.push($27)}

            align($bytes, $stream)
            var fillBits=
              readUb($bytes, $stream, 4)
            var lineBits=
              readUb($bytes, $stream, 4)
          }
        }
        $7.push($8)}
      while(!eos)
      $4.push($6)
    }
    if(wide){

      var $47=
        $.codes=
        []
      var $48=glyphCount
      while($48--){
        $47.push(
          readUi16($bytes, $stream)
        )}
    }
    else{

      var $49=
        $.codes=
        []
      var $50=glyphCount
      while($50--){
        $49.push(
          readUi8($bytes, $stream)
        )}
    }
    if(hasLayout){

      $.ascent=
        readUi16($bytes, $stream)
      $.descent=
        readUi16($bytes, $stream)
      $.leading=
        readSi16($bytes, $stream)
      var $51=
        $.advance=
        []
      var $52=glyphCount
      while($52--){
        $51.push(
          readSi16($bytes, $stream)
        )}
      var $53=
        $.bbox=
        []
      var $54=glyphCount
      while($54--){
        var $55={}
        bbox($bytes, $stream, $55, swfVersion, tagCode);
        $53.push($55)}
      var kerningCount=
        readUi16($bytes, $stream)
      var $56=
        $.kerning=
        []
      var $57=kerningCount
      while($57--){
        var $58={}
        kerning($bytes, $stream, $58, swfVersion, tagCode);
        $56.push($58)}
    }
    return $
  }

  function fileAttributes($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    var reserved=
      readUb($bytes, $stream, 1)
    $.useDirectBlit=
      readUb($bytes, $stream, 1)
    $.useGpu=
      readUb($bytes, $stream, 1)
    $.hasMetadata=
      readUb($bytes, $stream, 1)
    $.doAbc=
      readUb($bytes, $stream, 1)
    $.noCrossDomainCaching=
      readUb($bytes, $stream, 1)
    $.relativeUrls=
      readUb($bytes, $stream, 1)
    $.network=
      readUb($bytes, $stream, 1)
    var pad=
      readUb($bytes, $stream, 24)
    return $
  }

  function doABC($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    if(tagCode===82){
      $.flags=
        readUi32($bytes, $stream)
    }
    else{
      $.flags=
        0
    }
    if(tagCode===82){
      $.name=
        readString($bytes, $stream, 0)
    }
    else{
      $.name=
        ""
    }
    $.data=
      readBinary($bytes, $stream, 0)
    return $
  }

  function symbolClass($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    var symbolCount=
      readUi16($bytes, $stream)
    var $0=
      $.exports=
      []
    var $1=symbolCount
    while($1--){
      var $2={}
      $2.symbolId=
        readUi16($bytes, $stream)
      $2.className=
        readString($bytes, $stream, 0)
      $0.push($2)}
    return $
  }

  function defineScalingGrid($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.symbolId=
      readUi16($bytes, $stream)
    var $0=$.splitter={}
    bbox($bytes, $stream, $0, swfVersion, tagCode)
    return $
  }

  function defineScene($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    var sceneCount=
      readEncodedU32($bytes, $stream)
    var $0=
      $.scenes=
      []
    var $1=sceneCount
    while($1--){
      var $2={}
      $2.offset=
        readEncodedU32($bytes, $stream)
      $2.name=
        readString($bytes, $stream, 0)
      $0.push($2)}
    var labelCount=
      readEncodedU32($bytes, $stream)
    var $3=
      $.labels=
      []
    var $4=labelCount
    while($4--){
      var $5={}
      $5.frame=
        readEncodedU32($bytes, $stream)
      $5.name=
        readString($bytes, $stream, 0)
      $3.push($5)}
    return $
  }

  function bbox($bytes, $stream, $, swfVersion, tagCode) {
    align($bytes, $stream)
    var bits=
      readUb($bytes, $stream, 5)
    var xMin=
      readSb($bytes, $stream, bits)
    var xMax=
      readSb($bytes, $stream, bits)
    var yMin=
      readSb($bytes, $stream, bits)
    var yMax=
      readSb($bytes, $stream, bits)
    $.left=
      xMin/20
    $.right=
      xMax/20
    $.top=
      yMin/20
    $.bottom=
      yMax/20
    align($bytes, $stream)
  }

  function rgb($bytes, $stream, $, swfVersion, tagCode) {
    $.red=
      readUi8($bytes, $stream)
    $.green=
      readUi8($bytes, $stream)
    $.blue=
      readUi8($bytes, $stream)
    $.alpha=
      255
  }

  function rgba($bytes, $stream, $, swfVersion, tagCode) {
    $.red=
      readUi8($bytes, $stream)
    $.green=
      readUi8($bytes, $stream)
    $.blue=
      readUi8($bytes, $stream)
    $.alpha=
      readUi8($bytes, $stream)
  }

  function argb($bytes, $stream, $, swfVersion, tagCode) {
    $.alpha=
      readUi8($bytes, $stream)
    $.red=
      readUi8($bytes, $stream)
    $.green=
      readUi8($bytes, $stream)
    $.blue=
      readUi8($bytes, $stream)
  }

  function fillSolid($bytes, $stream, $, swfVersion, tagCode) {
    var isMorph = $.isMorph;
    if(tagCode>22||isMorph){
      var $125=$.color={}
      rgba($bytes, $stream, $125, swfVersion, tagCode);
    }
    else{
      var $126=$.color={}
      rgb($bytes, $stream, $126, swfVersion, tagCode);
    }
    if(isMorph){
      var $127=$.colorMorph={}
      rgba($bytes, $stream, $127, swfVersion, tagCode);
    }
  }

  function matrix($bytes, $stream, $, swfVersion, tagCode) {
    align($bytes, $stream)
    var hasScale=
      readUb($bytes, $stream, 1)
    if(hasScale){
      var bits=
        readUb($bytes, $stream, 5)
      $.a=
        readFb($bytes, $stream, bits)
      $.d=
        readFb($bytes, $stream, bits)
    }
    else{
      $.a=
        1
      $.d=
        1
    }
    var hasRotate=
      readUb($bytes, $stream, 1)
    if(hasRotate){
      var bits=
        readUb($bytes, $stream, 5)
      $.b=
        readFb($bytes, $stream, bits)
      $.c=
        readFb($bytes, $stream, bits)
    }
    else{
      $.b=
        0
      $.c=
        0
    }
    var bits=
      readUb($bytes, $stream, 5)
    var e=
      readSb($bytes, $stream, bits)
    var f=
      readSb($bytes, $stream, bits)
    $.tx=
      e/20
    $.ty=
      f/20
    align($bytes, $stream)
  }

  function cxform($bytes, $stream, $, swfVersion, tagCode) {
    align($bytes, $stream)
    var hasOffsets=
      readUb($bytes, $stream, 1)
    var hasMultipliers=
      readUb($bytes, $stream, 1)
    var bits=
      readUb($bytes, $stream, 4)
    if(hasMultipliers){

      $.redMultiplier=
        readSb($bytes, $stream, bits)
      $.greenMultiplier=
        readSb($bytes, $stream, bits)
      $.blueMultiplier=
        readSb($bytes, $stream, bits)
      if(tagCode>4){
        $.alphaMultiplier=
          readSb($bytes, $stream, bits)
      }
      else{
        $.alphaMultiplier=
          256
      }
    }
    else{

      $.redMultiplier=
        256
      $.greenMultiplier=
        256
      $.blueMultiplier=
        256
      $.alphaMultiplier=
        256
    }
    if(hasOffsets){

      $.redOffset=
        readSb($bytes, $stream, bits)
      $.greenOffset=
        readSb($bytes, $stream, bits)
      $.blueOffset=
        readSb($bytes, $stream, bits)
      if(tagCode>4){
        $.alphaOffset=
          readSb($bytes, $stream, bits)
      }
      else{
        $.alphaOffset=
          0
      }
    }
    else{

      $.redOffset=
        0
      $.greenOffset=
        0
      $.blueOffset=
        0
      $.alphaOffset=
        0
    }
    align($bytes, $stream)
  }

  function fillGradient($bytes, $stream, $, swfVersion, tagCode, type) {
    var isMorph = $.isMorph;
    var $128=$.matrix={}
    matrix($bytes, $stream, $128, swfVersion, tagCode);
    if(isMorph){
      var $129=$.matrixMorph={}
      matrix($bytes, $stream, $129, swfVersion, tagCode);
    }
    gradient($bytes, $stream, $, swfVersion, tagCode);
  }

  function gradient($bytes, $stream, $, swfVersion, tagCode, type) {
    var isMorph = $.isMorph;
    if(tagCode===83){
      $.spreadMode=
        readUb($bytes, $stream, 2)
      $.interpolationMode=
        readUb($bytes, $stream, 2)
    }
    else{
      var pad=
        readUb($bytes, $stream, 4)
    }
    var count=
      $.count=
      readUb($bytes, $stream, 4)
    var $130=
      $.records=
      []
    var $131=count
    while($131--){
      var $132={}
      gradientRecord($bytes, $stream, $132, swfVersion, tagCode);
      $130.push($132)
    }
    if(type===19){
      $.focalPoint=
        readFixed8($bytes, $stream)
      if(isMorph){
        $.focalPointMorph=
          readFixed8($bytes, $stream)
      }
    }
  }

  function gradientRecord($bytes, $stream, $, swfVersion, tagCode) {
    var isMorph = $.isMorph;
    $.ratio=
      readUi8($bytes, $stream)
    if(tagCode>22){
      var $133=$.color={}
      $133.red=
        readUi8($bytes, $stream)
      $133.green=
        readUi8($bytes, $stream)
      $133.blue=
        readUi8($bytes, $stream)
      $133.alpha=
        readUi8($bytes, $stream)
    }
    else{
      var $134=$.color={}
      $134.red=
        readUi8($bytes, $stream)
      $134.green=
        readUi8($bytes, $stream)
      $134.blue=
        readUi8($bytes, $stream)
      $134.alpha=
        255
    }
    if(isMorph){        
      $.ratioMorph=
        readUi8($bytes, $stream)
      var $135=$.colorMorph={}
      $135.red=
        readUi8($bytes, $stream)
      $135.green=
        readUi8($bytes, $stream)
      $135.blue=
        readUi8($bytes, $stream)
      $135.alpha=
        readUi8($bytes, $stream)
    }
  }

  function morphShapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var lineBits = temp.lineBits;
    var fillBits = temp.fillBits;
    var $160=
      $.records=
      []
    do{
      var $161={}
      var temp = shapeRecord($bytes, $stream, $161, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes);
      var eos = temp.eos;
      var flags = temp.flags;
      var type = temp.type;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      $160.push($161)}
    while(!eos)
    var temp = styleBits($bytes, $stream, $, swfVersion, tagCode);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $162 = $.recordsMorph = [];
    do{
      var $163 = {};
      var temp = shapeRecord($bytes, $stream, $163, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes);
      var eos = temp.eos;
      var flags = temp.flags;
      var type = temp.type;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      $162.push($163)}
    while(!eos)
  }

  function shapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $160 = $.records = [];
    do {
      var $161 = {};
      var temp = shapeRecord($bytes, $stream, $161, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes);
      var eos = temp.eos;
      var flags = temp.flags;
      var type = temp.type;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      $160.push($161)
    } while(!eos)
  }

  function shapeRecord($bytes, $stream, $, swfVersion, tagCode, isMorph,
                       fillBits, lineBits, hasStrokes) {
    var type = $.type = readUb($bytes, $stream, 1);
    var flags = readUb($bytes, $stream, 5);
    var eos = $.eos = !(type || flags);
    if (type) {
      shapeRecordEdge($bytes, $stream, $, swfVersion, tagCode, flags);
    } else {
      var temp = shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph,
                                  fillBits, lineBits, hasStrokes);
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
    }
    return {
      type: type,
      flags: flags,
      eos: eos,
      fillBits: fillBits,
      lineBits: lineBits
    };
  }

  function shapeRecordEdge($bytes, $stream, $, swfVersion, tagCode, flags) {
    var isStraight=
      $.isStraight=
      flags>>4
    var tmp=
      flags&0x0f
    var bits=
      tmp+2
    if(isStraight){

      var isGeneral=
        $.isGeneral=
        readUb($bytes, $stream, 1)
      if(isGeneral){

        $.deltaX=
          readSb($bytes, $stream, bits)
        $.deltaY=
          readSb($bytes, $stream, bits)
      }
      else{

        var isVertical=
          $.isVertical=
          readUb($bytes, $stream, 1)
        if(isVertical){

          $.deltaY=
            readSb($bytes, $stream, bits)
        }
        else{

          $.deltaX=
            readSb($bytes, $stream, bits)
        }
      }
    }
    else {
      $.controlDeltaX=
        readSb($bytes, $stream, bits)
      $.controlDeltaY=
        readSb($bytes, $stream, bits)
      $.anchorDeltaX=
        readSb($bytes, $stream, bits)
      $.anchorDeltaY=
        readSb($bytes, $stream, bits)
    }
  }

  function shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph,
                            fillBits, lineBits, hasStrokes) {
    var $161 = $;
		if (tagCode>2) {
			var hasNewStyles = $161.hasNewStyles = flags >> 4;
		}
		else{
			var hasNewStyles = $161.hasNewStyles = 0;
		}
		var hasLineStyle =
      $161.hasLineStyle =
      flags >> 3 & 1;
		var hasFillStyle1 =
			$161.hasFillStyle1 =
			flags >> 2 & 1;
		var hasFillStyle0 =
			$161.hasFillStyle0 =
			flags >> 1 & 1;
		var move=
			$161.move =
			flags & 1;
		if (move) {
			var bits =
			  readUb($bytes, $stream, 5);
			$161.moveX =
			  readSb($bytes, $stream, bits);
			$161.moveY=
			  readSb($bytes, $stream, bits);
		}
		if (hasFillStyle0) {
			$161.fillStyle0 =
			  readUb($bytes, $stream, fillBits);
		}
		if(hasFillStyle1){
			$161.fillStyle1=
			  readUb($bytes,$stream,fillBits)
		}
		if (hasLineStyle) {
			$161.lineStyle =
			  readUb($bytes, $stream, lineBits);
		}
		if (hasNewStyles) {
      var temp = styles($bytes, $stream, $161, swfVersion, tagCode, isMorph, hasStrokes);
      var lineBits = temp.lineBits;
      var fillBits = temp.fillBits;
    }
    return {lineBits: lineBits, fillBits: fillBits};
  }

  function styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    fillStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph);
    lineStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var temp = styleBits($bytes, $stream, $, swfVersion, tagCode);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    return {fillBits: fillBits, lineBits: lineBits};
  }

  function fillStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    var tmp = readUi8($bytes, $stream)
    if (tagCode > 2 && tmp === 255) {
      var count = readUi16($bytes, $stream);
    }
    else{
      var count = tmp;
    }
    var $4 = $.fillStyles = [];
    var $5 = count;
    while ($5--) {
      var $6 = {};
      fillStyle($bytes, $stream, $6, swfVersion, tagCode, isMorph);
      $4.push($6);
    }
  }

  function lineStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var tmp = readUi8($bytes, $stream);
    if (tagCode > 2 && tmp === 255) {
      var count = readUi16($bytes, $stream);
    } else {
      var count = tmp;
    }
    var $138 = $.lineStyles = [];
    var $139 = count;
    while ($139--) {
      var $140 = {};
      lineStyle($bytes, $stream, $140, swfVersion, tagCode, isMorph, hasStrokes);
      $138.push($140)
    }
  }

  function styleBits($bytes, $stream, $, swfVersion, tagCode) {
    align($bytes, $stream);
    var fillBits = readUb($bytes, $stream, 4);
    var lineBits = readUb($bytes, $stream, 4);
    return {
      fillBits: fillBits,
      lineBits: lineBits
    };
  }

  function fillStyle($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    var type = $.type = readUi8($bytes, $stream);
    switch (type) {
    case 0:
      fillSolid($bytes, $stream, $, swfVersion, tagCode);
      break
    case 16:
    case 18:
    case 19:
      fillGradient($bytes, $stream, $, swfVersion, tagCode, type);
      break
    case 64:
    case 65:
    case 66:
    case 67:
      fillBitmap($bytes, $stream, $, swfVersion, tagCode, isMorph, type);
      break
    default:
      throw new Error("Invalid fill style parsing SWF: tagCode=" + tagCode + " type=" + type);
    }
  };

  function lineStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    $.width=
      readUi16($bytes, $stream)
    if(isMorph){
      $.widthMorph=
        readUi16($bytes, $stream)
    }
    if(hasStrokes){
      align($bytes, $stream)
      $.startCapStyle=
        readUb($bytes, $stream, 2)
      var joinStyle=
        $.joinStyle=
        readUb($bytes, $stream, 2)
      var hasFill=
        $.hasFill=
        readUb($bytes, $stream, 1)
      $.noHscale=
        readUb($bytes, $stream, 1)
      $.noVscale=
        readUb($bytes, $stream, 1)
      $.pixelHinting=
        readUb($bytes, $stream, 1)
      var reserved=
        readUb($bytes, $stream, 5)
      $.noClose=
        readUb($bytes, $stream, 1)
      $.endCapStyle=
        readUb($bytes, $stream, 2)
      if(joinStyle===2){
        $.miterLimitFactor=
          readFixed8($bytes, $stream)
      }
      if(hasFill){
        var $141=$.fillStyle={}
        fillStyle($bytes, $stream, $141, swfVersion, tagCode, isMorph);
      }
      else{
        var $155=$.color={}
        rgba($bytes, $stream, $155, swfVersion, tagCode);
        if(isMorph){
          var $156=$.colorMorph={}
          rgba($bytes, $stream, $156, swfVersion, tagCode);
        }
      }
    }
    else{
      if(tagCode>22){
        var $157=$.color={}
        rgba($bytes, $stream, $157, swfVersion, tagCode);
      }
      else{
        var $158=$.color={}
        rgb($bytes, $stream, $158, swfVersion, tagCode);
      }
      if(isMorph){
        var $159=$.colorMorph={}
        rgba($bytes, $stream, $159, swfVersion, tagCode);
      }
    }
  }

  function fillBitmap($bytes, $stream, $, swfVersion, tagCode, isMorph, type) {
    $.bitmapId=
      readUi16($bytes, $stream)
    var $18=$.matrix={}
    matrix($bytes, $stream, $18, swfVersion, tagCode);
    if(isMorph){
      var $19=$.matrixMorph={}
      matrix($bytes, $stream, $19, swfVersion, tagCode);
    }
    $.condition=
      type===64||type===67
  }

            
  function filterGlow($bytes, $stream, $, swfVersion, tagCode) {
    if(type===4||type===7){
      var count=
        readUi8($bytes, $stream)
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
      rgba($bytes, $stream, $7, swfVersion, tagCode);
      $5.push($7)}
    if(type===3){
      var $8=$4.higlightColor={}
      rgba($bytes, $stream, $8, swfVersion, tagCode);
    }
    if(type===4||type===7){

      var $9=
        $4.ratios=
        []
      var $10=count
      while($10--){
        $9.push(
          readUi8($bytes, $stream)
        )}
    }
    $4.blurX=
      readFixed($bytes, $stream)
    $4.blurY=
      readFixed($bytes, $stream)
    if(type!==2){

      $4.angle=
        readFixed($bytes, $stream)
      $4.distance=
        readFixed($bytes, $stream)
    }
    $4.strength=
      readFixed8($bytes, $stream)
    $4.innerShadow=
      readUb($bytes, $stream, 1)
    $4.knockout=
      readUb($bytes, $stream, 1)
    $4.compositeSource=
      readUb($bytes, $stream, 1)
    if(type===3){

      $4.onTop=
        readUb($bytes, $stream, 1)
    }
    else{

      var reserved=
        readUb($bytes, $stream, 1)
    }
    if(type===4||type===7){

      $4.passes=
        readUb($bytes, $stream, 4)
    }
    else{

      var reserved=
        readUb($bytes, $stream, 4)
    }
  }

  function filterBlur($bytes, $stream, $, swfVersion, tagCode) {
    $4.blurX=
      readFixed($bytes, $stream)
    $4.blurY=
      readFixed($bytes, $stream)
    $4.passes=
      readUb($bytes, $stream, 5)
    var reserved=
      readUb($bytes, $stream, 3)
  }

  function filterConvolution($bytes, $stream, $, swfVersion, tagCode) {
    $4.columns=
      readUi8($bytes, $stream)
    $4.rows=
      readUi8($bytes, $stream)
    $4.divisor=
      readFloat($bytes, $stream)
    $4.bias=
      readFloat($bytes, $stream)
    var $17=
      $4.weights=
      []
    var $18=columns*rows
    while($18--){
      $17.push(
        readFloat($bytes, $stream)
      )}
    var $19=$4.defaultColor={}
    rgba($bytes, $stream, $19, swfVersion, tagCode);
    var reserved=
      readUb($bytes, $stream, 6)
    $4.clamp=
      readUb($bytes, $stream, 1)
    $4.preserveAlpha=
      readUb($bytes, $stream, 1)
  }

  function filterColorMatrix($bytes, $stream, $, swfVersion, tagCode) {
    var $20=
      $4.matrix=
      []
    var $21=20
    while($21--){
      $20.push(
        readFloat($bytes, $stream)
      )}
  }

  function anyFilter($bytes, $stream, $, swfVersion, tagCode) {
    var type=
      $.type=
      readUi8($bytes, $stream)
    switch(type){
    case 0:
    case 2:
    case 3:
    case 4:
    case 7:
      filterGlow($bytes, $stream, $, swfVersion, tagCode);
      break
    case 1:
      filterBlur($bytes, $stream, $, swfVersion, tagCode);
      break
    case 5:
      filterConvolution($bytes, $stream, $, swfVersion, tagCode);
      break
    case 6:
      filterColorMatrix($bytes, $stream, $, swfVersion, tagCode);
      break
    default:
    }
  }

  function events($bytes, $stream, $, swfVersion, tagCode) {
    if(swfVersion>=6){
      var flags=
        readUi32($bytes, $stream)
    }
    else{
      var flags=
        readUi16($bytes, $stream)
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
        readUi32($bytes, $stream)
      if(keyPress){
        $29.keyCode=
          readUi8($bytes, $stream)
      }
      $29.actionsData=
        readBinary($bytes, $stream, length - (keyPress ? 1 : 0))
    }
  }

  function kerning($bytes, $stream, $, swfVersion, tagCode) {
    if(wide){

      $58.code1=
        readUi16($bytes, $stream)
      $58.code2=
        readUi16($bytes, $stream)
    }
    else{

      $58.code1=
        readUi8($bytes, $stream)
      $58.code2=
        readUi8($bytes, $stream)
    }
    $58.adjustment=
      readUi16($bytes, $stream)
  }

})();

var readHeader = function readHeader($bytes, $stream, $, swfVersion, tagCode){
  $ || ($ = {});
  var $0=$.bbox={}
  align($bytes, $stream)
  var bits=
    readUb($bytes, $stream, 5)
  var xMin=
    readSb($bytes, $stream, bits)
  var xMax=
    readSb($bytes, $stream, bits)
  var yMin=
    readSb($bytes, $stream, bits)
  var yMax=
    readSb($bytes, $stream, bits)
  $0.left=
    xMin/20
  $0.right=
    xMax/20
  $0.top=
    yMin/20
  $0.bottom=
    yMax/20
  align($bytes, $stream)
  var reserved=
    readUi8($bytes, $stream)
  $.frameRate=
    readUi8($bytes, $stream)
  $.frameCount=
    readUi16($bytes, $stream)
  return $
}
