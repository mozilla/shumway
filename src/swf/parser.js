/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function (window, undefined) {

  'use strict';

  //////////////////////////////////////////////////////////////////////////////
  //
  // Basic Data Types
  //
  //////////////////////////////////////////////////////////////////////////////

  const SI8         = 0;
  const SI16        = 1;
  const SI32        = 2;
  const UI8         = 3;
  const UI16        = 4;
  const UI32        = 5;
  const FIXED       = 6;
  const FIXED8      = 7;
  const FLOAT16     = 8;
  const FLOAT       = 9;
  const DOUBLE      = 10;
  const EncodedU32  = 11;
  const SB          = 12;
  const UB          = 13;
  const FB          = 14;
  const STRING      = 15;
  const BINARY      = 16;

  const UI24        = 17;
  const FLAG        = 18;
  const UB2         = 19;
  const UB3         = 20;
  const UB4         = 21;
  const UB5         = 22;
  const UB6         = 23;
  const UB7         = 24;
  const UB8         = 25
  const UB10        = 26;
  const UB12        = 27;
  const UB16        = 28;
  const UB17        = 29;

  const TAG         = 30;
  const COLOR       = 31;

  var LANGCODE = UI8;

  var RGB = {
    red: UI8,
    green: UI8,
    blue: UI8
  };

  var RGBA = {
    rgb: {
      type: RGB,
      seamless: true
    },
    alpha: UI8
  };

  var ARGB = {
    alpha: UI8,
    rgb: {
      type: RGB,
      seamless: true
    }
  };

  var RECT = {
    $nBits: UB5,
    xMin: SB,
    xMax: SB,
    yMin: SB,
    yMax: SB
  };

  var MATRIX = {
    $hasScale: FLAG,
    scale: {
      type: {
        $nBits: UB5,
        scaleX: FB,
        scaleY: FB
      },
      seamless: true,
      condition: 'hasScale'
    },
    $hasRotate: FLAG,
    rotate: {
      type: {
        $nBits: UB5,
        rotateSkew0: FB,
        rotateSkew1: FB
      },
      seamless: true,
      condition: 'hasRotate'
    },
    $nBits: UB5,
    translateX: SB,
    translateY: SB
  };

  var MULTTERMS = {
    redMultTerm: SB,
    greenMultTerm: SB,
    blueMultTerm: SB
  };

  var ADDTERMS = {
    redAddTerm: SB,
    greenAddTerm: SB,
    blueAddTerm: SB
  };

  var CXFORM = {
    $hasAddTerms: FLAG,
    $hasMultTerms: FLAG,
    $nBits: UB4,
    multTerms: {
      type: MULTTERMS,
      seamless: true,
      condition: 'hasMultTerms'
    },
    addTerms: {
      type: ADDTERMS,
      seamless: true,
      condition: 'hasAddTerms'
    }
  };

  var CXFORMWITHALPHA = {
    $hasAddTerms: FLAG,
    $hasMultTerms: FLAG,
    $nBits: UB4,
    multTerms: {
      type: {
        terms: {
          type: MULTTERMS,
          seamless: true
        },
        alphaMultTerm: SB
      },
      seamless: true,
      condition: 'hasMultTerms'
    },
    addTerms: {
      type: {
        terms: {
          type: ADDTERMS,
          seamless: true
        },
        alphaAddTerm: SB
      },
      seamless: true,
      condition: 'hasAddTerms'
    }
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Actions
  //
  //////////////////////////////////////////////////////////////////////////////

  var REGISTERPARAM = {
    register: UI8,
    paramName: STRING
  };

  var actions = {

    /* GotoFrame */ 129: {
      frame: STRING
    },

    /* GetURL */ 131: {
      url: STRING,
      target: STRING
    },

    /* WaitForFrame */ 138: {
      frame: UI16,
      skipCount: UI8
    },

    /* SetTarget */ 139: {
      targetName: STRING
    },

    /* GoToLabel */ 140: {
      label: STRING
    },

    /* Push */ 150: {
      values: {
        type: {
          $valueType: UI8,
          value: {
            type: ['valueType', {
              0: { string: STRING },
              1: { 'float': FLOAT },
              4: { registerNumber: UI8 },
              5: { 'boolean': UI8 },
              6: { 'double': DOUBLE },
              7: { 'integer': UI32 },
              8: { constant8: UI8 },
              9: { constant16: UI16 }
              }],
              seamless: true
            }
          },
          list: true
        }
      },

      /* Jump */ 153: {
        branchOffset: SI16
      },

      /* If */ 157: {
        branchOffset: SI16
      },

      /* GetURL2 */ 154: {
        sendVarsMethod: UB2,
        reserved: UB4,
        loadTarget: FLAG,
        loadVariables: FLAG
      },

      /* GotoFrame2 */ 159: {
        reserved: UB6,
        $hasSceneBias: FLAG,
        play: FLAG,
        sceneBias: {
          type: UI16,
          condition: 'hasSceneBias'
        }
      },

      /* ConstantPool */ 136: {
        $count: UI16,
        constantPool: {
          type: STRING,
          list: { count: 'count' }
        }
      },

      /* DefineFunction */ 155: {
        functionName: STRING,
        numParams: UI16,
        params: {
          type: STRING,
          list: { count: 'numParams' }
        },
        $codeSize: UI16,
        actions: {
          type: ACTIONRECORD,
          list: { length: 'codeSize' }
        }
      },

      /* With */ 148: {
        size: UI16,
        actions: {
          type: ACTIONRECORD,
          list: { length: 'size' }
        }
      },

      /* StoreRegister */ 135: {
        registerNumber: UI8
      },

      /* DefineFunction2 */ 142: {
        functionName: STRING,
        $numParams: UI16,
        registerCount: UI8,
        preloadParent: FLAG,
        preloadRoot: FLAG,
        suppressSuper: FLAG,
        preloadSuper: FLAG,
        suppressArguments: FLAG,
        preloadArguments: FLAG,
        suppressThis: FLAG,
        preloadThis: FLAG,
        reserved: UB7,
        preloadGlobal: FLAG,
        params: {
          type: REGISTERPARAM,
          list: { count: 'numParams' }
        },
        $codeSize: UI16,
        actions: {
          type: ACTIONRECORD,
          list: { length: 'codeSize' }
        }
      },

      /* Try */ 143: {
        reserved: UB5,
        $catchInRegister: FLAG,
        $hasFinallyBlock: FLAG,
        $hasCatchBlock: FLAG,
        $trySize: UI16,
        $catchSize: UI16,
        $finallySize: UI16,
        catchName: {
          type: STRING,
          condition: '!catchInRegister'
        },
        catchRegister: {
          type: UI8,
          condition: 'catchInRegister'
        },
        tryActions: {
          type: ACTIONRECORD,
          list: { length: 'trySize' }
        },
        catchActions: {
          type: ACTIONRECORD,
          list: { length: 'catchSize' }
        },
        finallyActions: {
          type: ACTIONRECORD,
          list: { length: 'finallySize' }
        }
      }

  }; // end of actions

  var ACTIONRECORD = {
    $actionCode: UI8,
    length: {
      type: UI16,
      condition: 'actionCode>=128'
    },
    action: {
      type: ['actionCode', actions],
      seamless: true
    }
  };

  var DOACTION = {
    actions: {
      type: ACTIONRECORD,
      list: true
    }
  };

  var DOINITACTION = {
    spriteId: UI16,
    actions: {
      type: ACTIONRECORD,
      list: true
    }
  };

  var DOABC = {
    flags: UI32,
    name: STRING,
    abcData: BINARY
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // The Display List
  //
  //////////////////////////////////////////////////////////////////////////////

  var PLACEOBJECT = {
    characterId: UI16,
    depth: UI16,
    matrix: MATRIX,
    colorTransform: {
      type: CXFORM,
      optional: true
    }
  };

  var PLACEFLAGS = {
    $hasClipActions: FLAG,
    $hasClipDepth: FLAG,
    $hasName: FLAG,
    $hasRatio: FLAG,
    $hasColorTransform: FLAG,
    $hasMatrix: FLAG,
    $hasCharacter: FLAG,
    move: FLAG
  };

  var PLACEINFO = {
    characterId: {
      type: UI16,
      condition: 'hasCharacter'
    },
    matrix: {
      type: MATRIX,
      condition: 'hasMatrix'
    },
    colorTransform: {
      type: CXFORM,
      condition: 'hasColorTransform'
    },
    ratio: {
      type: UI16,
      condition: 'hasRatio'
    },
    name: {
      type: STRING,
      condition: 'hasName'
    },
    clipDepth: {
      type: UI16,
      condition: 'hasClipDepth'
    }
  };

  var CLIPEVENTFLAGS = {
    keyUp: FLAG,
    keyDown: FLAG,
    mouseUp: FLAG,
    mouseDown: FLAG,
    mouseMove: FLAG,
    unload: FLAG,
    enterFrame: FLAG,
    load: FLAG,
    dragOver: FLAG,
    rollOut: FLAG,
    rollOver: FLAG,
    releaseOutside: FLAG,
    release: FLAG,
    press: FLAG,
    initialize: FLAG,
    data: FLAG,
    extraEvents: {
      type: {
        reserved: UB5,
        construct: FLAG,
        keyPress: FLAG,
        dragOut: FLAG,
        reserved2: UI8
      },
      seamless: true,
      condition: 'version>=6'
    }
  };

  var CLIPACTIONRECORD = {
    $eventFlags: CLIPEVENTFLAGS,
    $actionRecordSize: UI32,
    $keyCode: {
      type: UI8,
      condition: 'eventFlags.keyPress'
    },
    actions: {
      type: ACTIONRECORD,
      list: { length: 'actionRecordSize-eventFlags.keyPress' }
    }
  };

  var CLIPACTIONS = {
    reserved: UI16,
    allEventFlags: CLIPEVENTFLAGS,
    actionRecords: {
      type: CLIPACTIONRECORD,
      list: { condition: 'eventFlags' }
    }
  };

  var PLACEOBJECT2 = {
    flags: {
      type: PLACEFLAGS,
      seamless: true
    },
    depth: UI16,
    info: {
      type: PLACEINFO,
      seamless: true
    },
    clipActions: {
      type: CLIPACTIONS,
      condition: 'hasClipActions'
    }
  };

  var COLORMATRIXFILTER = {
    matrix: {
      type: FLOAT,
      list: { count: 20 }
    }
  };

  var CONVOLUTIONFILTER = {
    $matrixX: UI8,
    $matrixY: UI8,
    divisor: FLOAT,
    bias: FLOAT,
    matrix: {
      type: FLOAT,
      list: { count: 'matrixX*matrixY' }
    },
    defaultColor: RGBA,
    reserved: UB6,
    clamp: FLAG,
    preserveAlpha: FLAG
  };

  var BLURFILTER = {
    blurX: FIXED,
    blurY: FIXED,
    passes: UB5,
    reserved: UB3
  };

  var DROPSHADOWFILTER = {
    dropShadowColor: RGBA,
    blurX: FIXED,
    blurY: FIXED,
    angle: FIXED,
    distance: FIXED,
    strength: FIXED8,
    innerShadow: FLAG,
    knockout: FLAG,
    compositeSource: FLAG,
    passes: UB5
  };

  var GLOWFILTER = {
    glowColor: RGBA,
    blurX: FIXED,
    blurY: FIXED,
    strength: FIXED8,
    innerGlow: FLAG,
    knockout: FLAG,
    compositeSource: FLAG,
    passes: UB5
  };

  var BEVELFILTER = {
    shadowColor: RGBA,
    highlightColor: FIXED,
    blurX: FIXED,
    blurY: FIXED,
    angle: FIXED,
    distance: FIXED8,
    strength: FLAG,
    innerShadow: FLAG,
    knockout: FLAG,
    compositeSource: FLAG,
    onTop: FLAG,
    passes: UB4
  };

  var GRADIENTGLOWFILTER = {
    $numColors: UI8,
    gradienColors: {
      type: RGBA,
      list: { count: 'numColors' }
    },
    gradientRatios: {
      type: UI8,
      list: { count: 'numColors' }
    },
    blurX: FIXED,
    blurY: FIXED,
    angle: FIXED,
    distance: FIXED,
    strength: FIXED8,
    innerShadow: FLAG,
    knockout: FLAG,
    compositeSource: FLAG,
    onTop: FLAG,
    passes: UB4
  };

  var GRADIENTBEVELFILTER = GRADIENTGLOWFILTER;

  var FILTER = {
    $filterId: UI8,
    filter: {
      type: ['filterId', {
        0: { dropShadowFilter: DROPSHADOWFILTER },
        1: { blurFilter: BLURFILTER },
        2: { glowFilter: GLOWFILTER },
        3: { bevelFilter: BEVELFILTER },
        4: { gradientGlowFilter: GRADIENTGLOWFILTER },
        5: { convolutionFilter: CONVOLUTIONFILTER },
        6: { colorMatrixFilter: COLORMATRIXFILTER },
        7: { gradientBevelFilter: GRADIENTBEVELFILTER }
      }],
      seamless: true
    }
  };

  var FILTERLIST = {
    $numberOfFilters: UI8,
    filters: {
      type: FILTER,
      list: { count: 'numberOfFilters' }
    }
  };

  var PLACEOBJECT3 = {
    flags: {
      type: PLACEFLAGS,
      seamless: true
    },
    reserved: UB3,
    $hasImage: FLAG,
    $hasClassName: FLAG,
    $hasCacheAsBitmap: FLAG,
    $hasBlendMode: FLAG,
    $hasFilterList: FLAG,
    depth: UI16,
    className: {
      type: STRING,
      condition: 'hasClassName||hasImage&&hasCharacter'
    },
    info: {
      type: PLACEINFO,
      seamless: true
    },
    filterList: {
      type: FILTERLIST,
      condition: 'hasFilterList'
    },
    blendMode: {
      type: UI8,
      condition: 'hasBlendMode'
    },
    bitmapCache: {
      type: UI8,
      condition: 'hasCacheAsBitmap'
    },
    clipActions: {
      type: CLIPACTIONS,
      condition: 'hasClipActions'
    }
  };

  var REMOVEOBJECT = {
    characterId: UI16,
    depth: UI16
  };

  var REMOVEOBJECT2 = {
    depth: UI16
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Gradients
  //
  //////////////////////////////////////////////////////////////////////////////

  var GRADRECORD = {
    ratio: UI8,
    color: COLOR
  };

  var GRADIENT = {
    spreadMode: UB2,
    interpolationMode: UB2,
    $numGradients: UB4,
    gradientRecords: {
      type: GRADRECORD,
      list: { count: 'numGradients' }
    }
  };

  var FOCALGRADIENT = {
    gradient: {
      type: GRADIENT,
      seamless: true
    },
    focalPoint: FIXED8
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Shapes
  //
  //////////////////////////////////////////////////////////////////////////////

  // Fill styles ///////////////////////////////////////////////////////////////

  var GRADIENTINFO = {
    matrix:  MATRIX,
    gradient: {
      type: ['fillStyleType', {
        16: GRADIENT,
        18: GRADIENT,
        19: FOCALGRADIENT
      }]
    }
  };

  var BITMAPINFO = {
    bitmapId: UI16,
    matrix: MATRIX
  };

  var FILLSTYLE = {
    $fillType: UI8,
    fill: {
      type: ['fillType', {
        0: { color: COLOR },
        16: GRADIENTINFO,
        18: GRADIENTINFO,
        19: GRADIENTINFO,
        64: BITMAPINFO,
        65: BITMAPINFO,
        66: BITMAPINFO,
        67: BITMAPINFO
      }],
      seamless: true
    }
  };

  var FILLSTYLEARRAY = {
    $count: UI8,
    $countExtended: {
      type: UI16,
      condition: 'count===255'
    },
    styles: {
      type: FILLSTYLE,
      list: { count: 'count<255?count:countExtended' }
    }
  };

  // Line styles ///////////////////////////////////////////////////////////////

  var LINESTYLE = {
    width: UI16,
    color: COLOR
  };

  var LINESTYLE2 = {
    width: UI16,
    startCapStyle: UB2,
    $joinStyle: UB2,
    $hasFill: FLAG,
    noHScale: FLAG,
    noVScale: FLAG,
    pixelHinting: FLAG,
    reserved: UB5,
    noClose: FLAG,
    endCapStyle: UB2,
    miterLimitFactor: {
      type: UI16,
      condition: 'joinStyle===2'
    },
    color: {
      type: RGBA,
      condition: '!hasFill'
    },
    fillType: {
      type: FILLSTYLE,
      condition: 'hasFill'
    }
  };

  var LINESTYLEARRAY = {
    $count: UI8,
    $countExtended: {
      type: UI16,
      condition: 'count===255'
    },
    styles: {
      type: LINESTYLE,
      list: { count: 'count<255?count:countExtended' }
    }
  };

  // Shape structures /////////////////////////////////////////////////////////

  var STYLECHANGERECORD = {
    $hasNewStyles: FLAG,
    $hasLineStyle: FLAG,
    $hasFillStyle1: FLAG,
    $hasFillStyle0: FLAG,
    $moveTo: FLAG,
    move: {
      type: {
        $moveBits: UB5,
        moveDeltaX: {
          type: SB,
          params: ['moveBits']
        },
        moveDeltaY: {
          type: SB,
          params: ['moveBits']
        }
      },
      seamless: true,
      condition: 'moveTo'
    },
    fillStyle0: {
      type: UB,
      params: ['numFillBits'],
      condition: 'hasFillStyle0'
    },
    fillStyle1: {
      type: UB,
      params: ['numFillBits'],
      condition: 'hasFillStyle1'
    },
    lineStyle: {
      type: UB,
      params: ['numLineBits'],
      condition: 'hasLineStyle'
    },
    newStyles: {
      type: {
        fillStyles: FILLSTYLEARRAY,
        lineStyles: LINESTYLEARRAY,
        $numFillBits: UB4,
        $numLineBits: UB4
      },
      seamless: true,
      condition: 'hasNewStyle'
    }
  };

  var STRAIGHTEDGERECORD = {
    $numBits: {
      type: UB4,
      appendix: '+2'
    },
    $isGeneralLine: FLAG,
    $isVertLine: {
      type: FLAG,
      condition: '!isGeneralLine'
    },
    deltaX: {
      type: SB,
      condition: 'isGeneralLine||!isVertLine'
    },
    deltaY: {
      type: SB,
      condition: 'isGeneralLine||isVertLine'
    }
  };

  var CURVEDEDGERECORD = {
    $numBits: {
      type: UB4,
      appendix: '+2'
    },
    controlDeltaX: SB,
    controlDeltaY: SB,
    anchorDeltaX: SB,
    anchorDeltaY: SB
  };

  var EDGERECORD = {
    $isStraight: FLAG,
    edge: {
      type: ['isStraight', CURVEDEDGERECORD, STRAIGHTEDGERECORD],
      seamless: true
    }
  };

  var SHAPERECORD = {
    $recordType: FLAG,
    record: {
      type: ['recordType', STYLECHANGERECORD, EDGERECORD],
      seamless: true
    }
  };

  var SHAPE = {
    $numFillBits: UB4,
    $numLineBits: UB4,
    shapeRecords: {
      type: SHAPERECORD,
      list: { condition: 'type||$flags' }
    }
  };

  var SHAPEWITHSTYLE = {
    fillStyles: FILLSTYLEARRAY,
    lineStyles: LINESTYLEARRAY,
    shape: {
      TYPE: SHAPE,
      seamless: true
    }
  };

  var DEFINESHAPE = {
    id: UI16,
    bounds: RECT,
    shapes: SHAPEWITHSTYLE
  };

  var DEFINESHAPE2 = {
    id: UI16,
    bounds: RECT,
    shapes: SHAPEWITHSTYLE
  };

  var DEFINESHAPE4 = {
    id: UI16,
    bounds: RECT,
    edgeBounds: RECT,
    reserved: UB5,
    usesFillWindingRule: FLAG,
    usesNonScalingStrokes: FLAG,
    usesScalingStrokes: FLAG,
    shapes: SHAPEWITHSTYLE
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Bitmaps
  //
  //////////////////////////////////////////////////////////////////////////////

  var DEFINEBITS = {
    id: UI16,
    jpegData: BINARY
  };

  var JPEGTABLES = {
    jpegData: BINARY
  };

  var DEFINEBITSJPEG2 = {
    id: UI16,
    imageData: BINARY
  };

  var DEFINEBITSJPEG3 = {
    id: UI16,
    $alphaDataOffset: UI32,
    imageData: {
      type: BINARY,
      length: 'alphaDataOffset'
    },
    alphaData: {
      type: BINARY,
      compressed: true
    }
  };

  var COLORMAPDATA = {
    colorTable: {
      type: RGB,
      list: { count: 'colorTableSize' }
    },
    pixelData: BINARY
  };

  var PIX15 = {
    reserved: FLAG,
    red: UB5,
    green: UB5,
    blue: UB5
  };

  var PIX24 = {
    reserved: UI8,
    rgb: {
      type: RGB,
      seamless: true
    }
  };

  var BITMAPDATA = {
    pixelData: {
      type: ['format', {
        4: PIX15,
        5: PIX24
      }]
    }
  };

  var ALPHACOLORMAPDATA = {
    colorTable: {
      type: RGBA,
      list: { count: 'colorTableSize' }
    },
    pixelData: BINARY
  };

  var ALPHABITMAPDATA = {
    pixelData: RGBA
  };

  var DEFINEBITSLOSSLESS = {
    id: UI16,
    $format: UI8,
    width: UI16,
    height: UI16,
    $colorTableSize: {
      type: UI8,
      condition: 'format===3'
    },
    bitmapData: {
      type: {
        type: ['format', {
          3: COLORMAPDATA,
          4: BITMAPDATA,
          5: BITMAPDATA
        }]
      },
      compressed: true
    }
  };

  var DEFINEBITSLOSSLESS2 = {
    id: UI16,
    format: UI8,
    width: UI16,
    height: UI16,
    $colorTableSize: {
      type: UI8,
      condition: 'format===3'
    },
    bitmapData: {
      type: {
        type: ['format', {
          3: ALPHACOLORMAPDATA,
          4: ALPHABITMAPDATA,
          5: ALPHABITMAPDATA
        }]
      },
      compressed: true
    }
  };

  var DEFINEBITSJPEG4 = {
    id: UI16,
    $alphaDataOffset: UI32,
    deblockParam: UI16,
    imageData: {
      type: BINARY,
      length: 'alphaDataOffset'
    },
    alphaData: {
      type: BINARY,
      compressed: true
    }
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Shape Morphing
  //
  //////////////////////////////////////////////////////////////////////////////

  // Morph gradient values /////////////////////////////////////////////////////

  var MORPHGRADRECORD = {
    startRatio: UI8,
    endRatio: UI8,
    startColor: RGBA,
    endColor: RGBA
  };

  var MORPHGRADIENT = {
    $numGradients: UB4,
    gradientRecords: {
      type: MORPHGRADRECORD,
      list: { count: 'numGradients' }
    }
  };

  // Morph fill styles /////////////////////////////////////////////////////////

  var MORPHGRADIENTINFO = {
    startMatrix: MATRIX,
    endMatrix: MATRIX,
    gradient: MORPHGRADIENT
  };

  var MORPHBITMAPINFO = {
    bitmapId: UI16,
    startMatrix: MATRIX,
    endMatrix: MATRIX
  };

  var MORPHFILLSTYLE = {
    $fillType: UI8,
    fill: {
      type: ['fillType', {
        0: {
          startColor: RGBA,
          endColor: RGBA
        },
        16: MORPHGRADIENTINFO,
        18: MORPHGRADIENTINFO,
        64: MORPHBITMAPINFO,
        65: MORPHBITMAPINFO,
        66: MORPHBITMAPINFO,
        67: MORPHBITMAPINFO
      }],
      seamless: true
    }
  };

  var MORPHFILLSTYLEARRAY = {
    $count: UI8,
    $countExtended: {
      type: UI16,
      condition: 'count===255'
    },
    styles: {
      type: MORPHFILLSTYLE,
      list: { count: 'count<255?count:countExtended' }
    }
  };

  // Morph line styles /////////////////////////////////////////////////////////

  var MORPHLINESTYLE = {
    startWidth: UI16,
    endWidth: UI16,
    startColor: RGBA,
    endColor: RGBA
  };

  var MORPHLINESTYLE2 = {
    startWidth: UI16,
    endWidth: UI16,
    startCapStyle: UB2,
    $joinStyle: UB2,
    $hasFill: FLAG,
    noHScale: FLAG,
    noVScale: FLAG,
    pixelHinting: FLAG,
    reserved: UB5,
    noClose: FLAG,
    endCapStyle: UB2,
    miterLimitFactor: {
      type: UI16,
      condition: 'joinStyle===2'
    },
    color: {
      type: {
        startColor: RGBA,
        endColor: RGBA
      },
      seamless: true,
      condition: '!hasFill'
    },
    fillType: {
      type: MORPHFILLSTYLE,
      condition: 'hasFill'
    }
  };

  var MORPHLINESTYLEARRAY = {
    $count: UI8,
    $countExtended: {
      type: UI16,
      condition: 'count===255'
    },
    styles: {
      type: MORPHLINESTYLE,
      list: { count: 'count<255?count:countExtended' }
    }
  };

  var DEFINEMORPHSHAPE = {
    id: UI16,
    startBounds: RECT,
    endBounds: RECT,
    offset: UI32,
    fillStyles: MORPHFILLSTYLEARRAY,
    lineStyles: MORPHLINESTYLEARRAY,
    startEdges: SHAPE,
    endEdges: SHAPE
  };

  var DEFINEMORPHSHAPE2 = {
    id: UI16,
    startBounds: RECT,
    endBounds: RECT,
    startEdgeBounds: RECT,
    endEdgeBounds: RECT,
    reserved: UB6,
    usesNonScalingStrokes: FLAG,
    usesScalingStrokes: FLAG,
    offset: UI32,
    fillStyles: MORPHFILLSTYLEARRAY,
    lineStyles: MORPHLINESTYLEARRAY,
    startEdges: SHAPE,
    endEdges: SHAPE
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Fonts and Text
  //
  //////////////////////////////////////////////////////////////////////////////

  var DEFINEFONT = {
    id: UI16,
    $numGlyphs: {
      type: UI16,
      appendix: '/2'
    },
    offsetTable: {
      type: UI16,
      list: { count: 'numGlyphs-1' }
    },
    glyphTable: {
      type: SHAPE,
      list: { count: 'numGlyphs' }
    }
  };

  var DEFINEFONTINFO = {
    fontId: UI16,
    $fontNameLen: UI8,
    fontName: {
      type: STRING,
      length: 'fontNameLen'
    },
    reserved: UB2,
    isSmall: FLAG,
    isShiftJis: FLAG,
    isAnsi: FLAG,
    isItalic: FLAG,
    isBold: FLAG,
    usesWideCodes: FLAG,
    codeTable: {
      type: ['usesWideCodes', UI8, UI16],
      list: true
    }
  };

  var DEFINEFONTINFO2 = {
    fontId: UI16,
    fontNameLen: UI8,
    fontName: {
      type: STRING,
      length: 'fontNameLen'
    },
    reserved: UB2,
    isSmall: FLAG,
    isShiftJis: FLAG,
    isAnsi: FLAG,
    isItalic: FLAG,
    isBold: FLAG,
    $usesWideCodes: FLAG,
    languageCode: LANGCODE,
    codeTable: {
      type: ['usesWideCodes', UI8, UI16],
      list: true
    }
  };

  var KERNINGRECORD = {
    code1: ['usesWideCodes', UI8, UI16],
    code2: ['usesWideCodes', UI8, UI16],
    adjustment: SI16
  };

  var DEFINEFONT2 = {
    fontId: UI16,
    $hasLayout: FLAG,
    isShiftJis: FLAG,
    isSmall: FLAG,
    isAnsi: FLAG,
    usesWideOffsets: FLAG,
    usesWideCodes: FLAG,
    isItalic: FLAG,
    isBold: FLAG,
    languageCode: LANGCODE,
    fontNameLen: UI8,
    fontName: {
      type: STRING,
      length: 'fontNameLen'
    },
    $numGlyphs: UI16,
    offsetTable: {
      type: ['usesWideOffsets', UI16, UI32],
      list: { count: 'numGlyphs' }
    },
    codeTableOffset: ['usesWideOffsets', UI16, UI32],
    glyphTable: {
      type: SHAPE,
      list: { count: 'numGlyphs' }
    },
    codeTable: {
      type: ['usesideCodes', UI8, UI16],
      list: { count: 'numGlyphs' }
    },
    layout: {
      type: {
        ascent: SI16,
        descent: SI16,
        leading: SI16,
        advanceTable: {
          type: SI16,
          list: { count: 'numGlyphs' }
        },
        boundsTable: {
          type: RECT,
          list: { count: 'numGlyphs' }
        },
        $kerningCount: UI16,
        kerningTable: {
          type: KERNINGRECORD,
          list: { count: 'kerningCount' }
        }
      },
      seamless: true,
      condition: 'hasLayout'
    }
  };

  var ZONEDATA = {
    alignmentCoordinate: FLOAT16,
    range: FLOAT16
  };

  var ZONERECORD = {
    $numZoneData: UI8,
    zoneData: {
      type: ZONEDATA,
      list: { count: 'numZoneData' }
    },
    reserved: UB6,
    maskY: FLAG,
    maskX: FLAG
  };

  var DEFINEFONTALIGNZONES = {
    fontId: UI16,
    csmTableHint: UB2,
    reserved: UB6,
    zoneTable: {
      type: ZONERECORD,
      list: true
    }
  };

  var DEFINEFONTNAME = {
    fontId: UI16,
    fontName: STRING,
    copyright: STRING
  };

  var GLYPHENTRY = {
    index: {
      type: UB,
      params: ['glyphBits']
    },
    advance: {
      type: SB,
      params: ['advanceBits']
    }
  };

  var TEXTRECORD = {
    $recordType: FLAG,
    reserved: UB3,
    $hasFont: FLAG,
    $hasColor: FLAG,
    $hasYOffset: FLAG,
    $hasXOffset: FLAG,
    fontId: {
      type: UI16,
      condition: 'hasFont'
    },
    color: {
      type: COLOR,
      condition: 'hasColor'
    },
    xOffset: {
      type: SI16,
      condition: 'hasXOffset'
    },
    yOffset: {
      type: SI16,
      condition: 'hasYOffset'
    },
    fontSize: {
      type: UI16,
      condition: 'hasFont'
    },
    $glyphCount: UI8,
    glyphEntries: {
      type: GLYPHENTRY,
      list: { count: 'glyphCount' }
    }
  };

  var DEFINETEXT = {
    id: UI16,
    bounds: RECT,
    matrix: MATRIX,
    $glyphBits: UI8,
    $advanceBits: UI8,
    textRecords: {
      type: TEXTRECORD,
      list: { condition: 'recordType' }
    }
  };

  var DEFINEEDITTEXT = {
    id: UI16,
    bounds: RECT,
    $hasText: FLAG,
    wordWrap: FLAG,
    isMultiline: FLAG,
    isPassword: FLAG,
    readOnly: FLAG,
    $hasTextColor: FLAG,
    $hasMaxLength: FLAG,
    $hasFont: FLAG,
    $hasFontClass: FLAG,
    autoSize: FLAG,
    $hasLayout: FLAG,
    noSelect: FLAG,
    hasBorder: FLAG,
    wasStatic: FLAG,
    usesHtml: FLAG,
    useOutlines: FLAG,
    fontId: {
      type: UI16,
      condition: 'hasFont'
    },
    fontClass: {
      type: STRING,
      condition: 'hasFontClass'
    },
    fontSize: {
      type: UI16,
      condition: 'hasFont'
    },
    color: {
      type: RGBA,
      condition: 'hasColor'
    },
    maxLength: {
      type: UI16,
      condition: 'hasMaxLength'
    },
    layout: {
      type: {
        align: UI16,
        leftMargin: UI16,
        rightMargin: UI16,
        indent: UI16,
        leading: SI16
      },
      seamless: true,
      condition: 'hasLayout'
    },
    variableName: STRING,
    intitialText: {
      type: STRING,
      condition: 'hasText'
    }
  };

  var CSMTEXTSETTINGS = {
    textId: UI16,
    useFlashType: UB2,
    gridFit: UB3,
    reserved: UB3,
    thickness: FLOAT,
    sharpness: FLOAT,
    reserved2: UI8
  };

  var DEFINEFONT4 = {
    id: UI16,
    reserved: UB5,
    hasFontData: FLAG,
    isItalic: FLAG,
    isBold: FLAG,
    fontName: STRING,
    fontData: {
      type: BINARY,
      optional: true
    }
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Sounds
  //
  //////////////////////////////////////////////////////////////////////////////

  var ADPCMMONOPACKET = {
    initialSample: SI16,
    initialIndex: UB6,
    codes: {
      type: UB,
      params: ['$codeSize+2'],
      list: { count: 4095 }
    }
  };

  var ADPCMSTEREOPACKET = {
    initialSampleLeft: SI16,
    initialIndexLeft: UB6,
    initialSampleRight: SI16,
    initialIndexRight: UB6,
    codes: {
      type: UB,
      params: ['$codeSize+2'],
      list: { count: 8190 }
    }
  };

  var ADPCMSOUNDDATA = {
    $codeSize: UB2,
    packets: ['soundType', ADPCMMONOPACKET, ADPCMSTEREOPACKET]
  };

  var mpeg1Bitrates =
    [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  var mpeg1SamplingRates = [44100, 48000, 32000];

  var mpeg2xBitrates =
    [8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  var mpeg2SamplingRates = [22050, 24000, 16000];
  var mpeg25SamplingRates = [11025, 12000, 8000];

  var MP3FRAME = {
    syncword: UB11,
    $mpegVersion: UB2,
    layer: UB2,
    isProtected: FLAG,
    $bitrate: UB4,
    $samplingRate: UB2,
    $isPadded: FLAG,
    reserved: FLAG,
    channelMode: UB2,
    modeExtension: UB2,
    isCopyrighted: FLAG,
    isOriginal: FLAG,
    emphasis: UB2,
    sampleData: {
      type: ['mpegVersion', {
        0: {
          type: BINARY,
          length: '((72*mpeg2xBitrates[bitrate]*1000)' +
            '/mpeg25SamplingRates[samplingRate]+isPadded-4)/8'
        },
        2: {
          type: BINARY,
          length: '((72*mpeg2xBitrates[bitrate]*1000)' +
            '/mpeg2SamplingRates[samplingRate]+isPadded-4)/8'
        },
        3: {
          type: BINARY,
          length: '((144*mpeg1Bitrates[bitrate]*1000)' +
            '/mpeg1SamplingRates[samplingRate]+isPadded-4)/8'
        }
      }]
    }
  };

  var MP3SOUNDDATA = {
    seekSamples: SI16,
    frames: {
      type: MP3FRAME,
      list: true
    }
  };

  var DEFINESOUND = {
    id: UI16,
    format: UB4,
    rate: UB2,
    size: FLAG,
    soundType: FLAG,
    sampleCount: UI32,
    soundData: ['format', {
      1: ADPCMSOUNDDATA,
      2: MP3SOUNDDATA
    }]
  };

  var SOUNDENVELOPE = {
    pos44: UI32,
    leftLevel: UI16,
    rightLevel: UI16
  };

  var SOUNDINFO = {
    reserved: UB2,
    stopSync: FLAG,
    noMultipleSync: FLAG,
    $hasEnvelope: FLAG,
    $hasLoops: FLAG,
    $hasOutPoint: FLAG,
    $hasInPoint: FLAG,
    inPoint: {
      type: UI32,
      condition: 'hasInPoint'
    },
    outPoint: {
      type: UI32,
      condition: 'hasOutPoint'
    },
    loopCount: {
      type: UI16,
      condition: 'hasLoops'
    },
    envelope: {
      type: {
        $envPoints: UI8,
        envelopeRecords: {
          type: SOUNDENVELOPE,
          list: { count: 'envPoints' }
        }
      },
      seamless: true,
      condition: 'hasEnvelope'
    }
  };

  var STARTSOUND = {
    soundId: UI16,
    soundInfo: SOUNDINFO
  };

  var STARTSOUND2 = {
    soundClassName: STRING,
    soundInfo: SOUNDINFO
  };

  var SOUNDSTREAMHEAD = {
    reserved: UB4,
    playbackRate: UB2,
    playbackSize: FLAG,
    playbackType: FLAG,
    $streamCompression: UB4,
    streamRate: UB2,
    sreamSize: FLAG,
    streamType: FLAG,
    streamSampleCount: UI16,
    latencySeek: {
      type: SI16,
      condition: 'streamCompression===2'
    }
  };

  var SOUNDSTREAMBLOCK = {
    streamData: ['streamCompression', {
      1: ADPCMSOUNDDATA,
      2: MP3SOUNDDATA
    }]
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Buttons
  //
  //////////////////////////////////////////////////////////////////////////////

  var BUTTONRECORD = {
    reserved: UB4,
    stateHitTest: FLAG,
    stateDown: FLAG,
    stateOver: FLAG,
    stateUp: FLAG,
    characterId: UI16,
    depth: UI16,
    matrix: MATRIX
  };

  var DEFINEBUTTON = {
    id: UI16,
    characters: {
      type: BUTTONRECORD,
      list: { condition: 'flags' }
    },
    actions: {
      type: ACTIONRECORD,
      list: { condition: 'actionCode' }
    }
  };

  var BUTTONRECORD2 = {
    reserved: UB2,
    $hasBlendMode: FLAG,
    $hasFilterList: FLAG,
    stateHitTest: FLAG,
    stateDown: FLAG,
    stateOver: FLAG,
    stateUp: FLAG,
    characterId: UI16,
    depth: UI16,
    matrix: MATRIX,
    colorTransform: CXFORMWITHALPHA,
    filters: {
      type: FILTERLIST,
      condition: 'hasFilterList'
    },
    blendMode: {
      type: UI8,
      condition: 'hasBlendMode'
    }
  };

  var BUTTONCONDACTION = {
    actionSize: UI16,
    idleToOverDown: FLAG,
    outDownToIdle: FLAG,
    outDownToOverDown: FLAG,
    overDownToOutDown: FLAG,
    overDownToOverUp: FLAG,
    overUpToOverDown: FLAG,
    overUpToIdle: FLAG,
    idleToOverUp: FLAG,
    keyPress: UB7,
    overDownToIdle: FLAG,
    actions: {
      type: ACTIONRECORD,
      list: { condition: 'actionCode' }
    }
  };

  var DEFINEBUTTON2 = {
    id: UI16,
    reserved: UB7,
    trackAsMenu: FLAG,
    $actionOffset: UI16,
    characters: {
      type: BUTTONRECORD2,
      list: { condition: '' }
    },
    actions: {
      type: {
        actions: BUTTONCONDACTION,
        list: { condition: 'actionOffset' }
      },
      seamless: true,
      condition: 'actionOffset'
    }
  };

  var DEFINEBUTTONCXFORM = {
    buttonId: UI16,
    colorTransform: CXFORM
  };

  var DEFINEBUTTONSOUND = {
    buttonId: UI16,
    characters: {
      type: {
        characterId: UI16,
        soundInfo: {
          type: SOUNDINFO,
          condition: 'characterId'
        }
      },
      list: { count: 4 }
    }
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Video
  //
  //////////////////////////////////////////////////////////////////////////////

  var MACROBLOCK = {
    isCoded: FLAG,
    macroblockType: -1 // varies,
    blockPattern: -1 // varies,
    quantizerInformation: UB2,
    motionVectorData: {
      type: -1 // varies,
      list: { count: 2 }
    },
    extraMotionVectorData: {
      type: -1 // varies,
      list: { count: 6 }
    },
    blockData: BINARY
  };

  var H263VIDEOPACKET = {
    pictureStartCode: UB17,
    version: UB5,
    temporalReference: UB8,
    $pictureSize: UB3,
    customWidth: {
      type: ['pictureSize', UB8, UB16]
    },
    customHeight: {
      type: ['pictureSize', UB8, UB16]
    },
    pictureType: UB2,
    useDeblocking: FLAG,
    quantizer: UB5,
    extraInformations: {
      $hasExtraInformation: FLAG,
      extraInformation: {
        type: UB8,
        condition: 'hasExtraInformation'
      },
      list: { condition: 'hasExtraInformation' }
    },
    macroblock: MACROBLOCK,
    pictureStuffing: -1 // varies
  };

  var IMAGEBLOCK = {
    $dataSize: UB16,
    pixelData: {
      type: BINARY,
      list: { count: 'dataSize' }
    }
  };

  var SCREENVIDEOPACKET = {
    blockWidth: UB4,
    imageWidth: UB12,
    blockHeight: UB4,
    imageHeight: UB12,
    imageBlocks: {
      type: IMAGEBLOCK,
      list: true
    }
  };

  var IMAGEFORMAT = {
    reserved: UB3,
    colorDepth: UB2,
    hasDiffBlocks: FLAG,
    usesZlibPrimeCompressCurrent: FLAG,
    usesZlibPrimeCompressPrevious: FLAG
  };

  var IMAGEDIFFPOSITION = {
    rowStart: UI8,
    height: UI8
  };

  var IMAGEPRIMEPOSITION = {
    column: UI8,
    row: UI8
  };

  var IMAGEBLOCKV2 = {
    $dataSize: UB16,
    format: IMAGEFORMAT,
    imageBlockHeader: -1 // varies,
    pixelData: {
      type: BINARY,
      list: { count: 'dataSize' }
    }
  };

  var SCREENV2VIDEOPACKET = {
    blockWidth: UB4,
    imageWidth: UB12,
    blockHeight: UB4,
    imageHeight: UB12,
    reserved: UB6,
    $hasIframeImage: FLAG,
    $hasPaletteInfo: FLAG,
    paletteInfo: {
      type: IMAGEBLOCK,
      condition: 'hasPaletteInfo'
    },
    imageBlocks: {
      type: IMAGEBLOCKV2,
      list: true
    },
    iframeImage: {
      type: IMAGEBLOCKV2,
      condition: 'hasIframeImage',
      list: true
    }
  };

  var VP6FLVVIDEOPACKET = {
    horizontalAdjustment: UB4,
    verticalAdjustment: UB4,
    videoData: BINARY
  };

  var VP6FLVALPHAVIDEOPACKET = {
    horizontalAdjustment: UB4,
    verticalAdjustment: UB4,
    $offsetToAlpha: UI24,
    videoData: {
      type: BINARY,
      length: 'offsetToAlpha'
    },
    alphaData: BINARY
  };

  var VP6SWFVIDEOPACKET = {
    videoData: BINARY
  };

  var VP6SWFALPHAVIDEOPACKET = {
    $offsetToAlpha: UI24,
    videoData: {
      type: BINARY
      length: 'offsetToAlpha'
    },
    alphaData: BINARY
  };

  var DEFINEVIDEOSTREAM = {
    id: UI16,
    numFrames: UI16,
    width: UI16,
    height: UI16,
    reserved: UB4,
    deblocking: UB3,
    enableSmoothing: FLAG,
    codecId: UI8
  };

  var VIDEOFRAME = {
    streamId: UI16,
    frameNum: UI16,
    videoData: BINARY
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Tags
  //
  //////////////////////////////////////////////////////////////////////////////

  var tags = {

    // Display list tags ///////////////////////////////////////////////////////

    /* PlaceObject */ 4: PLACEOBJECT,
    /* PlaceObject2 */ 26: PLACEOBJECT2,
    /* PlaceObject3 */ 70: PLACEOBJECT3,
    /* RemoveObject */ 5: REMOVEOBJECT,
    /* RemoveObject2 */ 28: REMOVEOBJECT2,

    // Control tags ////////////////////////////////////////////////////////////

    /* SetBackgroundColor */ 9: {
      backgroundColor: RGB
    },

    /* FrameLabel */ 43: {
      name: STRING,
      isNamedAnchor: {
        type: UI8,
        optional: true
      }
    },

    /* Protect */ 24: {
      password: {
        type: STRING,
        optional: true
      }
    },

    /* ExportAssets */ 56: {
      $count: UI16,
      assets: {
        type: {
          tag: UI16,
          name: STRING
        },
        list: { count: 'count' }
      }
    },

    /* ImportAssets */ 57: {
      url: STRING,
      $count: UI16,
      assets: {
        type: {
          tag: UI16,
          name: STRING
        },
        list: { count: 'count' }
      }
    },

    /* EnableDebugger */ 58: {
      password: STRING
    },

    /* EnableDebugger2 */ 64: {
      reserved: UI16,
      password: STRING
    },

    /* ScriptLimits */ 65: {
      maxRecursionDepth: UI16,
      scriptTimeoutSeconds: UI16
    },

    /* SetTabIndex */ 66: {
      depth: UI16,
      tabIndex: UI16
    },

    /* FileAttributes */  69: {
      reserved: FLAG,
      useDirectBlit: FLAG,
      useGPU: FLAG,
      hasMedatata: FLAG,
      useActionScript3: FLAG,
      reserved2: UB3,
      useNetwork: FLAG,
      reserved3: UI24
    },

    /* ImportAssets2 */ 71: {
      url: STRING,
      reserved: UI8,
      reserved2: UI8,
      $count: UI16,
      assets: {
        type: {
          tag: UI16,
          name: STRING
        },
        list: { count: 'count' }
      }
    },

    /* SymbolClass */ 76: {
      $numSymbols: UI16,
      symbols: {
        type: {
          tag: UI16,
          name: STRING
        },
        list: { count: 'numSymbols' }
      }
    },

    /* Metadata */ 77: {
      metadata: STRING
    },

    /* DefineScalingGrid */ 78: {
      characterId: UI16,
      splitter: RECT
    },

    /* DefineSceneAndFrameLabelData */ 86: {
      $sceneCount: EncodedU32,
      scenes: {
        type: {
          offset: EncodedU32,
          name: STRING
        },
        list: { count: 'sceneCount' }
      },
      $frameLabelCount: EncodedU32,
      frameLabels: {
        type: {
          frameNum: EncodedU32,
          label: STRING
        },
        list: { count: 'frameLabelCount' }
      }
    },

    // Action tags /////////////////////////////////////////////////////////////

    /* DoAction*/ 12: DOACTION,
    /* DoInitAction */ 59: DOINITACTION,
    /* DoABC */ 82: DOABC,

    // Shape tags //////////////////////////////////////////////////////////////

    /* DefineShape */ 2: DEFINESHAPE,
    /* DefineShape2 */ 22: DEFINESHAPE2,
    /* DefineShape3 */ 32: DEFINESHAPE2,
    /* DefineShape4 */ 83: DEFINESHAPE4,

    // Bitmap tags /////////////////////////////////////////////////////////////

    /* DefineBits */ 6: DEFINEBITS,
    /* JPEGTables */ 8: JPEGTABLES,
    /* DefineBitsJPEG2 */ 21: DEFINEBITSJPEG2,
    /* DefineBitsJPEG3 */ 35: DEFINEBITSJPEG3,
    /* DefineBitsLossless */ 20: DEFINEBITSLOSSLESS,
    /* DefineBitsLossless2 */ 36: DEFINEBITSLOSSLESS2,
    /* DefineBitsJPEG4 */ 90: DEFINEBITSJPEG4,

    // Shape morphing tags /////////////////////////////////////////////////////

    /* DefineMorphShape */ 46: DEFINEMORPHSHAPE,
    /* DefineMorphShape2 */ 84: DEFINEMORPHSHAPE2,

    // Font tags ///////////////////////////////////////////////////////////////

    /* DefineFont */ 10: DEFINEFONT,
    /* DefineFontInfo */ 13: DEFINEFONTINFO,
    /* DefineFontInfo2 */ 62: DEFINEFONTINFO2,
    /* DefineFont2 */ 48: DEFINEFONT2,
    /* DefineFont3 */ 75: DEFINEFONT2,
    /* DefineFontAlignZones */ 73: DEFINEFONTALIGNZONES,
    /* DefineFontName */ 88: DEFINEFONTNAME,
    /* DefineText */ 11: DEFINETEXT,
    /* DefineText2 */ 33: DEFINETEXT,
    /* DefineEditText */ 37: DEFINEEDITTEXT,
    /* CSMTextSettings */ 74: CSMTEXTSETTINGS,
    /* DefineFont4 */ 91: DEFINEFONT4,

    // Sound tags //////////////////////////////////////////////////////////////

    /* DefineSound */ 14: DEFINESOUND,
    /* StartSound */ 15: STARTSOUND,
    /* StartSound2 */ 89: STARTSOUND2,
    /* SoundStreamHead */ 18: SOUNDSTREAMHEAD,
    /* SoundStreamHead2 */ 45: SOUNDSTREAMHEAD,
    /* SoundStreamBlock */ 19: SOUNDSTREAMBLOCK,

    // Button tags /////////////////////////////////////////////////////////////

    /* DefineButton */ 7: DEFINEBUTTON,
    /* DefineButton2 */ 34: DEFINEBUTTON2,
    /* DefineButtonCxform */ 23: DEFINEBUTTONCXFORM,
    /* DefineButtonSound */ 17: DEFINEBUTTONSOUND,

    // Movie clips /////////////////////////////////////////////////////////////

    /* DefineSprite */ 39: {
      id: UI16,
      frameCount: UI16,
      controlTags: {
        type: TAG,
        list: { condition: 'tagCode' }
      }
    },

    // Video tags //////////////////////////////////////////////////////////////

    /* DefineVideoStream */ 60: DEFINEVIDEOSTREAM,
    /* VideoFrame */ 61: VIDEOFRAME,

    // Binary data /////////////////////////////////////////////////////////////

    /* DefineBinaryData */ 87: {
      tag: UI16,
      reserved: UI32,
      binaryData: BINARY
    }

  }; // end of tags

  var TAGRECORD = {
    $tagCode: UB6,
    $shortLength: UB10,
    longLength: {
      type: UI32,
      condition: 'shortLength>=63'
    },
    tag: {
      type: ['tagCode', tags],
      seamless: true
    }
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // SWF File Structure
  //
  //////////////////////////////////////////////////////////////////////////////

  var SWFFILE = {
    signature: {
      type: STRING,
      length: 3
    },
    $version: UI8,
    fileLength: UI32,
    frameSize: RECT,
    frameRate: UI16,
    frameCount: UI16,
    tags: {
      type: TAG,
      seamless: true
    }
  };

  var SWFFILECOMPRESSED = {
    signature: {
      type: STRING,
      length: 3
    },
    $version: UI8,
    fileLength: UI32,
    body: {
      type: {
        frameSize: RECT,
        frameRate: UI16,
        frameCount: UI16,
        tags: {
          type: TAG,
          seamless: true
        }
      },
      compressed: true,
      seamless: true
    }
  };

})(this); // end of file
