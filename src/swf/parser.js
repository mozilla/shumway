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
  const TAG         = 18;
  const ACTION      = 19;

  const UB1         = 20;
  const UB2         = 21;
  const UB3         = 22;
  const UB4         = 23;
  const UB5         = 24;
  const UB6         = 25;
  const UB7         = 26;
  const UB8         = 27;
  const UB9         = 28;
  const UB10        = 29;
  const UB11        = 30;
  const UB12        = 31;
  const UB13        = 32;
  const UB14        = 33;
  const UB15        = 34;
  const UB16        = 35;
  const UB17        = 36;
  const FLAG        = 37;

  var LANGCODE = UI8;

  var RGB = {
    red: UI8,
    green: UI8,
    blue: UI8
  };

  var RGBA = {
    rgb: {
      type: RGB,
      merge: true
    },
    alpha: UI8
  };

  var ARGB = {
    alpha: UI8,
    rgb: {
      type: RGB,
      merge: true
    }
  };

  var RECT = {
    $numBits: UB5,
    xMin: SB,
    xMax: SB,
    yMin: SB,
    yMax: SB
  };

  var MATRIX = {
    $hasScale: FLAG,
    scale: {
      type: {
        $numBits: UB5,
        scaleX: FB,
        scaleY: FB
      },
      merge: true,
      condition: 'hasScale'
    },
    $hasRotate: FLAG,
    rotate: {
      type: {
        $numBits: UB5,
        rotateSkew0: FB,
        rotateSkew1: FB
      },
      merge: true,
      condition: 'hasRotate'
    },
    $numBits: UB5,
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
    $numBits: UB4,
    multTerms: {
      type: MULTTERMS,
      merge: true,
      condition: 'hasMultTerms'
    },
    addTerms: {
      type: ADDTERMS,
      merge: true,
      condition: 'hasAddTerms'
    }
  };

  var CXFORMWITHALPHA = {
    $hasAddTerms: FLAG,
    $hasMultTerms: FLAG,
    $numBits: UB4,
    multTerms: {
      type: {
        terms: {
          type: MULTTERMS,
          merge: true
        },
        alphaMultTerm: SB
      },
      merge: true,
      condition: 'hasMultTerms'
    },
    addTerms: {
      type: {
        terms: {
          type: ADDTERMS,
          merge: true
        },
        alphaAddTerm: SB
      },
      merge: true,
      condition: 'hasAddTerms'
    }
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
      merge: true,
      condition: 'swfVersion>=6'
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
      type: ACTION,
      list: { length: 'actionRecordSize-(eventFlags.keyPress?1:0)' }
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
      merge: true
    },
    depth: UI16,
    info: {
      type: PLACEINFO,
      merge: true
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
    color: RGBA,
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
    color: RGBA,
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
    colors: {
      type: RGBA,
      list: { count: 'numColors' }
    },
    ratios: {
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
        0: DROPSHADOWFILTER,
        1: BLURFILTER,
        2: GLOWFILTER,
        3: BEVELFILTER,
        4: GRADIENTGLOWFILTER,
        5: CONVOLUTIONFILTER,
        6: COLORMATRIXFILTER,
        7: GRADIENTBEVELFILTER
      }],
      merge: true
    }
  };

  var FILTERLIST = {
    $numFilters: UI8,
    filters: {
      type: FILTER,
      list: { count: 'numFilters' }
    }
  };

  var PLACEOBJECT3 = {
    flags: {
      type: PLACEFLAGS,
      merge: true
    },
    reserved: UB3,
    $hasImage: FLAG,
    $hasClassName: FLAG,
    $cacheAsBitmap: FLAG,
    $hasBlendMode: FLAG,
    $hasFilterList: FLAG,
    depth: UI16,
    className: {
      type: STRING,
      condition: 'hasClassName||hasImage&&hasCharacter'
    },
    info: {
      type: PLACEINFO,
      merge: true
    },
    filterList: {
      type: FILTERLIST,
      merge: true,
      condition: 'hasFilterList'
    },
    blendMode: {
      type: UI8,
      condition: 'hasBlendMode'
    },
    bitmapCache: {
      type: UI8,
      condition: 'cacheAsBitmap'
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
  // Actions
  //
  //////////////////////////////////////////////////////////////////////////////

  var REGISTERPARAM = {
    registerNumber: UI8,
    paramName: STRING
  };

  var actions = {

    /* GotoFrame */ 129: {
      frame: UI16
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
              merge: true
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
        $numParams: UI16,
        params: {
          type: STRING,
          list: { count: 'numParams' }
        },
        $codeSize: UI16,
        actions: {
          type: ACTION,
          list: { length: 'codeSize' }
        }
      },

      /* With */ 148: {
        $codeSize: UI16,
        actions: {
          type: ACTION,
          list: { length: 'codeSize' }
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
          type: ACTION,
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
          type: ACTION,
          list: { length: 'trySize' }
        },
        catchActions: {
          type: ACTION,
          list: { length: 'catchSize' }
        },
        finallyActions: {
          type: ACTION,
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
      merge: true
    }
  };

  var DOACTION = {
    actions: {
      type: ACTION,
      list: true
    }
  };

  var DOINITACTION = {
    spriteId: UI16,
    actions: {
      type: ACTION,
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
  // Gradients
  //
  //////////////////////////////////////////////////////////////////////////////

  var GRADRECORD = {
    ratio: UI8,
    color: ['tagCode>22', RGB, RGBA]
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
      merge: true
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
    matrix: MATRIX,
    gradient: {
      type: ['fillType', {
        16: GRADIENT,
        18: GRADIENT,
        19: FOCALGRADIENT
      }],
      merge: true
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
        0: { color: ['tagCode>22', RGB, RGBA] },
        16: GRADIENTINFO,
        18: GRADIENTINFO,
        19: GRADIENTINFO,
        64: BITMAPINFO,
        65: BITMAPINFO,
        66: BITMAPINFO,
        67: BITMAPINFO
      }],
      merge: true
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
    color: ['tagCode>22', RGB, RGBA]
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
    fill: {
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

  // Shape structures //////////////////////////////////////////////////////////

  var STYLECHANGERECORD = {
    $hasNewStyles: FLAG,
    $hasLineStyle: FLAG,
    $hasFillStyle1: FLAG,
    $hasFillStyle0: FLAG,
    $moveTo: FLAG,
    move: {
      type: {
        $numBits: UB5,
        moveDeltaX: SB,
        moveDeltaY: SB,
      },
      merge: true,
      condition: 'moveTo'
    },
    fillStyle0: {
      type: UB,
      numBits: 'numFillBits',
      condition: 'hasFillStyle0'
    },
    fillStyle1: {
      type: UB,
      numBits: 'numFillBits',
      condition: 'hasFillStyle1'
    },
    lineStyle: {
      type: UB,
      numBits: 'numLineBits',
      condition: 'hasLineStyle'
    },
    newStyles: {
      type: {
        fillStyles: FILLSTYLEARRAY,
        lineStyles: LINESTYLEARRAY,
        $numFillBits: UB4,
        $numLineBits: UB4
      },
      merge: true,
      condition: 'hasNewStyles'
    }
  };

  var STRAIGHTEDGERECORD = {
    $numBits: {
      type: UB4,
      post: '+2'
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
      post: '+2'
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
      merge: true
    }
  };

  var SHAPERECORD = {
    $recordType: FLAG,
    record: {
      type: ['recordType', STYLECHANGERECORD, EDGERECORD],
      merge: true
    }
  };

  var SHAPE = {
    $numFillBits: UB4,
    $numLineBits: UB4,
    shapeRecords: {
      type: SHAPERECORD,
      list: { condition: 'recordType||$flags' }
    }
  };

  var SHAPEWITHSTYLE = {
    fillStyles: FILLSTYLEARRAY,
    lineStyles: LINESTYLEARRAY,
    shape: {
      type: SHAPE,
      merge: true
    }
  };

  var DEFINESHAPE = {
    id: UI16,
    bounds: RECT,
    edges: SHAPEWITHSTYLE
  };

  var DEFINESHAPE2 = {
    id: UI16,
    bounds: RECT,
    edges: SHAPEWITHSTYLE
  };

  var DEFINESHAPE4 = {
    id: UI16,
    bounds: RECT,
    edgeBounds: RECT,
    reserved: UB5,
    usesFillWindingRule: FLAG,
    usesNonScalingStrokes: FLAG,
    usesScalingStrokes: FLAG,
    edges: SHAPEWITHSTYLE
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
    reserved: UB1,
    red: UB5,
    green: UB5,
    blue: UB5
  };

  var PIX24 = {
    reserved: UI8,
    rgb: {
      type: RGB,
      merge: true
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
      compressed: true,
      merge: true
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
    pixelData: {
      type: ARGB,
      list: { count: 'width*height' }
    }
  };

  var DEFINEBITSLOSSLESS2 = {
    id: UI16,
    $format: UI8,
    $width: UI16,
    $height: UI16,
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
      compressed: true,
      merge: true
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
    gradient: {
      type: MORPHGRADIENT,
      merge: true
    }
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
      merge: true
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
      merge: true,
      condition: '!hasFill'
    },
    fill: {
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
      post: '/2'
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
    isSmallText: FLAG,
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
    isSmallText: FLAG,
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
    isSmallText: FLAG,
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
        ascent: UI16,
        descent: UI16,
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
      merge: true,
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
      numBits: 'numGlyphBits'
    },
    advance: {
      type: SB,
      numBits: 'numAdvanceBits'
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
      type: ['tagCode>11', RGB, RGBA],
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
    $numGlyphBits: UI8,
    $numAdvanceBits: UI8,
    textRecords: {
      type: TEXTRECORD,
      list: { condition: '$flags' }
    }
  };

  var DEFINEEDITTEXT = {
    id: UI16,
    bounds: RECT,
    $hasText: FLAG,
    wordWrap: FLAG,
    multiline: FLAG,
    password: FLAG,
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
    html: FLAG,
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
      merge: true,
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
      numBits: 'codeSize+2',
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
      numBits: 'codeSize+2',
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
    sampleData: ['mpegVersion',
      {
        type: BINARY,
        length: '((72*mpeg2xBitrates[bitrate]*1000)' +
          '/mpeg25SamplingRates[samplingRate]+isPadded-4)/8'
      }, undefined, {
        type: BINARY,
        length: '((72*mpeg2xBitrates[bitrate]*1000)' +
          '/mpeg2SamplingRates[samplingRate]+isPadded-4)/8'
      }, {
        type: BINARY,
        length: '((144*mpeg1Bitrates[bitrate]*1000)' +
          '/mpeg1SamplingRates[samplingRate]+isPadded-4)/8'
      }
    ]
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
    $format: UB4,
    rate: UB2,
    size: FLAG,
    $soundType: FLAG,
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
        $envPointCount: UI8,
        envelopeRecords: {
          type: SOUNDENVELOPE,
          list: { count: 'envPointCount' }
        }
      },
      merge: true,
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
    streamData: BINARY
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
      list: { condition: '$flags' }
    },
    actions: {
      type: ACTION,
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
    filterList: {
      type: FILTERLIST,
      merge: true,
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
      type: ACTION,
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
      list: { condition: '$flags' }
    },
    actions: {
      type: {
        actions: {
          type: BUTTONCONDACTION,
          list: { condition: 'actionSize' }
        }
      },
      merge: true,
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
    macroblockType: -1, // varies
    blockPattern: -1, // varies
    quantizerInformation: UB2,
    motionVectorData: {
      type: -1,// varies
      list: { count: 2 }
    },
    extraMotionVectorData: {
      type: -1, // varies
      list: { count: 6 }
    },
    blockData: BINARY
  };

  var H263VIDEOPACKET = {
    pictureStartCode: UB17,
    version: UB5,
    temporalReference: UB8,
    $pictureSize: UB3,
    customSize: {
      type: {
        customWidth: ['pictureSize', UB8, UB16],
        customHeight: ['pictureSize', UB8, UB16]
      },
      merge: true,
      condition: 'pictureSize<=1'
    },
    pictureType: UB2,
    useDeblocking: FLAG,
    quantizer: UB5,
    extraInformation: {
      type: {
        $hasInfo: FLAG,
        info: {
          type: UB8,
          condition: 'hasInfo'
        }
      },
      list: { condition: 'hasInfo' }
    },
    macroblock: MACROBLOCK,
    pictureStuffing: -1 // varies
  };

  var IMAGEBLOCK = {
    $dataSize: UB16,
    pixelData: {
      type: BINARY,
      length: 'dataSize'
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
    imageBlockHeader: -1, // varies
    pixelData: {
      type: BINARY,
      length: 'dataSize'
    }
  };

  var SCREENV2VIDEOPACKET = {
    $blockWidth: UB4,
    $imageWidth: UB12,
    $blockHeight: UB4,
    $imageHeight: UB12,
    reserved: UB6,
    $hasIframeImage: FLAG,
    $hasPaletteInfo: FLAG,
    paletteInfo: {
      type: IMAGEBLOCK,
      condition: 'hasPaletteInfo'
    },
    imageBlocks: {
      type: IMAGEBLOCKV2,
      list: { length: 'imageWidth/blockWidth*imageHeight/blockHeight' }
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
      type: BINARY,
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
    smoothing: FLAG,
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
      reserved: UB1,
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
      characterId: UI16,
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
      merge: true
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
    $swfVersion: UI8,
    fileLength: UI32,
    frameSize: RECT,
    frameRate: UI16,
    frameCount: UI16,
    tags: {
      type: TAG,
      merge: true
    }
  };

  var SWFFILECOMPRESSED = {
    signature: {
      type: STRING,
      length: 3
    },
    $swfVersion: UI8,
    fileLength: UI32,
    body: {
      type: {
        frameSize: RECT,
        frameRate: UI16,
        frameCount: UI16,
        tags: {
          type: TAG,
          merge: true
        }
      },
      compressed: true,
      merge: true
    }
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Parser Templates
  //
  //////////////////////////////////////////////////////////////////////////////

  var pow = Math.pow;
  var fcc = String.fromCharCode;

  function readSi8($bytes, $view) {
    return $view.getInt8($bytes.pos++);
  }
  function readSi16($bytes, $view) {
    return $view.getInt16($bytes.pos, $bytes.pos += 2);
  }
  function readSi32($bytes, $view) {
    return $view.getInt32($bytes.pos, $bytes.pos += 4);
  }
  function readUi8($bytes, $view) {
    return $bytes[$bytes.pos++];
  }
  function readUi16($bytes, $view) {
    return $view.getUint16($bytes.pos, $bytes.pos += 2);
  }
  function readUi24($bytes, $view) {
    return $view.getUint16($bytes.pos, $bytes.pos += 2) |
           ($bytes[$bytes.pos++] << 16);
  }
  function readUi32($bytes, $view) {
    return $view.getUint32($bytes.pos, $bytes.pos += 4);
  }
  function readFixed($bytes, $view) {
    return readUb($bytes, $view, 32) * pow(2, -16);
  }
  function readFixed8($bytes, $view) {
    return readUb($bytes, $view, 16) * pow(2, -8);
  }
  function readFloat16($bytes, $view) {
    var bits = readUb($bytes, $view, 16);
    var sign = bits >> 15 ? -1 : 1;
    var exponent = (bits & 0x7c00) >> 10;
    var fraction = bits & 0x03ff;
    if (!exponent)
      return sign * pow(2, -14) * (fraction / 1024);
    if (exponent === 0x1f)
      return fraction ? NaN : sign * Infinity;
    return sign * pow(2, exponent - 15) * (1 + (fraction / 1024));
  }
  function readFloat($bytes, $view) {
    return $view.getFloat32($bytes.pos, $bytes.pos += 4);
  }
  function readDouble($bytes, $view) {
    return $view.getFloat64($bytes.pos, $bytes.pos += 4);
  }
  function readEncodedU32($bytes, $view) {
    var val = 0;
    for (var i = 0; i < 5; ++i) {
      var b = $bytes[$bytes.pos++];
      val = value | ((b & 0x7f) << (7 * i));
      if (!(b & 0x80))
        break;
    }
    return val;
  }
  function readSb($bytes, $view, numBits) {
    return (readUb($bytes, $view, numBits) << (32 - numBits)) >> (32 - numBits);
  }
  function readUb($bytes, $view, numBits) {
    var buffer = $bytes.bitBuffer;
    var bitlen = $bytes.bitLength;
    while (numBits > bitlen) {
      buffer = (buffer << 8) | $bytes[$bytes.pos++];
      bitlen += 8;
    }
    var val = 0;
    var i = numBits;
    while (i--)
      val = (val << 1) | ((buffer >> --bitlen) & 1);
    $bytes.bitBuffer = buffer;
    $bytes.bitLength = bitlen;
    return val;
  }
  function readFb($bytes, $view, numBits) {
    return readUb($bytes, $view, numBits) * pow(2, -16);
  }
  function readString($bytes, $view, length) {
    var codes = [];
    if (length) {
      codes = slice.call($bytes, $bytes.pos, $bytes.pos += length);
    } else {
      var code;
      var i = 0;
      while (code = $bytes[$bytes.pos++])
        codes[i++] = code;
    }
    var numChunks = codes.length / 65536;
    var str = '';
    for (var i = 0; i < numChunks; ++i) {
      var s = codes.slice(i * 65536, (i + 1) * 65536);
      str += fcc.apply(null, s);
    }
    return decodeURIComponent(escape(str.replace('\0', '')));
  }
  function readBinary($bytes, $view, length) {
    return $bytes.subarray($bytes.pos, $bytes.pos += length);
  }

  var defaultTemplateSet = [
    readSi8, readSi16, readSi32, readUi8, readUi16, readUi32,
    readFixed, readFixed8, readFloat16, readFloat, readDouble,
    readEncodedU32,
    readSb, readUb, readFb, readString, readBinary,
    readUi24,
    'readTag($bytes,$view)', 'readAction($bytes,$view)'
  ];


  //////////////////////////////////////////////////////////////////////////////
  //
  // Parser
  //
  //////////////////////////////////////////////////////////////////////////////

  function fail(msg) {
    throw new Error(msg);
  }

  var max = Math.max;
  var splice = [].splice;

  var codeLengthOrder =
    [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

  var distanceCodes = [];
  var distanceExtraBits = [];
  for (var i = 0, j = 0, code = 1; i < 30; ++i) {
    distanceCodes[i] = code;
    code += 1 << (distanceExtraBits[i] = ~~((j += (i > 2 ? 1 : 0)) / 2));
  }

  var bitLengths = [];
  for (var i = 0; i < 32; ++i)
    bitLengths[i] = 5;
  var fixedDistanceTable = buildHuffmanTable(bitLengths);

  var lengthCodes = [];
  var lengthExtraBits = [];
  for (var i = 0, j = 0, code = 3; i < 29; ++i) {
    lengthCodes[i] = code - (i == 28 ? 1 : 0);
    code += 1 << (lengthExtraBits[i] = ~~(((j += (i > 4 ? 1 : 0)) / 4) % 6));
  }

  for (var i = 0; i < 287; ++i)
    bitLengths[i] = i < 144 || (i > 279 ? 8 : (i < 256 ? 9 : 7));
  var fixedLiteralTable = buildHuffmanTable(bitLengths);

  function buildHuffmanTable(bitLengths) {
    var maxBits = max.apply(null, bitLengths);
    var numLengths = bitLengths.length;
    var size = 1 << maxBits;
    var table = new Uint32Array(size);
    for (var code = 0, len = 1, skip = 2;
         len <= maxBits;
         code <<= 1, ++len, skip <<= 1)
    {
      for (var i = 0; i < numLengths; ++i) {
        if (bitLengths[i] === len) {
          var lsb = 0;
          for (var j = 0; j < len; ++j)
            lsb = (lsb * 2) + ((code >> j) & 1);
          for (var k = lsb; k < size; k += skip)
            table[k] = (len << 16) | i;
          ++code;
        }
      }
    }
    table.maxBits = maxBits;
    return table;
  }
  function inflateBlock(inBuffer, view, outBuffer) {
    if (inBuffer.eof)
      fail();
    var hdr = readBits(inBuffer, 3);
    switch (hdr >> 1) {
    case 0:
      inBuffer.bitBuffer = inBuffer.bitLength = 0;
      var pos = inBuffer.pos;
      var len = view.getUint16(pos);
      var nlen = view.getUint16(pos + 2);
      if (~nlen & 0xffff !== len)
        fail();
      var begin = pos + 4;
      var end = inBuffer.pos = begin + len;
      push.apply(outBuffer, inBuffer.subarray(begin, end));
      break;
    case 1:
      inflate(inBuffer, fixedLiteralTable, fixedDistanceTable);
      break;
    case 2:
      var bitLengths = [];
      var numLiteralCodes = readBits(inBuffer, 5) + 257;
      var numDistanceCodes = readBits(inBuffer, 5) + 1;
      var numCodes = numLiteralCodes + numDistanceCodes;
      var numCodelengthCodes = readBits(inBuffer, 4) + 4;
      for (var i = 0; i < 19; ++i)
        bitLengths[codeLengthOrder[i]] =
          i < numCodelengthCodes ? readBits(inBuffer, 3) : 0;
      var codeLengthTable = buildHuffmanTable(bitLengths);
      bitLengths = [];
      for (var i = 0, prevSym = 0; i < numCodes;) {
        var k = 1;
        var sym = decode(inBuffer, codeLengthTable);
        switch(sym){
        case 16:
          k = readBits(inBuffer, 2) + 3;
          sym = prevSym;
          break;
        case 17:
          k = readBits(inBuffer, 3) + 3;
          sym = 0;
          break;
        case 18:
          k = readBits(inBuffer, 7) + 11;
          sym = 0;
          break;
        default:
          prevSym = sym;
        }
        while (k--)
          bitLengths[i++] = sym;
      }
      var distanceTable =
        buildHuffmanTable(bitLengths.splice(numLiteralCodes, numDistanceCodes));
      var literalTable = buildHuffmanTable(bitLengths);
      inflate(inBuffer, outBuffer, literalTable, distanceTable);
      break;
    default:
       fail();
    }
    inBuffer.eof = hdr & 1;
  }
  function readBits(buffer, count) {
    var buffer = buffer.bitBuffer;
    var bufflen = buffer.bitLength;
    while (count > bufflen) {
      buffer |= buffer[buffer.pos++] << bufflen;
      bufflen += 8;
    }
    buffer.bitBuffer = buffer >>> count;
    buffer.bitLength = bufflen - count;
    return buffer & ((1 << count) - 1);
  }
  function inflate(inBuffer, outBuffer, literalTable, distanceTable) {
    var bufflen = inBuffer.byteLength;
    var pos = outBuffer.length;
    for (var sym; (sym = decode(inBuffer, literalTable)) !== 256;) {
      if (sym < 256) {
        outBuffer[pos++] = sym;
      } else {
        sym -= 257;
        var len = lengthCodes[sym] + readBits(inBuffer, lengthExtraBits[sym]);
        sym = decode(inBuffer, distanceTable);
        var distance =
          distanceCodes[sym] + readBits(inBuffer, distanceExtraBits[sym]);
        var i = pos - distance;
        while (len--)
          outBuffer[pos++] = inBuffer[i++];
      }
    }
  }
  function decode(buffer, codeTable) {
    var buffer = buffer.bitBuffer;
    var bitlen = buffer.bitLength;
    var maxBits = codeTable.maxBits;
    while (maxBits > bitlen) {
      buffer |= buffer[buffer.pos++] << bitlen;
      bitlen += 8;
    }
    var code = codeTable[buffer & ((1 << maxBits) - 1)];
    var len = code >> 16;
    if(!len)
      fail();
    buffer.bitBuffer = buffer >>> len;
    buffer.bitLength = bitlen - len;
    return code & 0xffff;
  }

  window.parseSWF = function (buffer) {
    var bytes = new Uint8Array(buffer);
    var b1 = bytes[0];
    var b2 = bytes[1];
    var b3 = bytes[2];
    var compressed = bytes[0] === 67;

    if (!(b2 === 87 && b3 === 83 && (b1 === 70 || compressed)))
      fail('invalid swf data');
    if (compressed)
      fail('compressed swf data is not supported yet');

    var readTag = generate(TAGRECORD, defaultTemplateSet);
    var readAction = generate(ACTIONRECORD, defaultTemplateSet);

    return generate(SWFFILE, defaultTemplateSet);
  }
  function generate(struct, templateSet) {
    function cast(type, options) {
      if (cast[type])
        return cast[type];
      var template = templateSet[type];
      if (typeof template === 'function') {
        var funcTerms =
          /^function (.*)\(([^\)]*)\) \{([.\s\S]*)\}$/.exec(template);
        var name = funcTerms[1];
        var params = funcTerms[2].split(', ');
        var expr;

        // inline simple template functions if single-lined
        if (params.length === 2) {
          var lines = funcTerms[3].split('\n');
          if (/^\s*return ([^;]*);$/.test(lines[1]))
            expr = RegExp.$1;
        }

        // overwrite custom parameters
        if (options.params)
          splice.apply(params, [2, options.params.length].concat(options.params));

        expr = name + '(' + params.join(',') + ')';

        // cache and return result
        return cast[type] = expr;
      }
      return template;
    }

    var productions = [];
    var localCount = 0;
    var align = false;

    (function translate(struct) {
      if (!struct.production) {
        var production = [];
        var propValList = [];
        var props = Object.keys(struct);
        for (var i = 0, prop; prop = props[i++];) {
          var type = struct[prop];
          var options = { };
          var expr = undefined;
          if (typeof type === 'object' && type.type) {
            options = type;
            type = type.type;
          }
          if (typeof type === 'number') {
            if (type >= UB1 && type <= FLAG) {
              // TODO: reduce amount of function calls by bulk reading bit fields
              options = {
                params: [type === FLAG ? 1 : type - 20],
                pre: type === FLAG ? '!!' : ''
              };
              type = UB;
              align = true;
            }
            // clear bit buffer before reading byte-aligned values
            if (align && type !== SB && type !== UB && type !== FB) {
              production.push('$bytes.bitBuffer=$bytes.bitLength=0');
              align = false;
            }
            expr = cast(type, options);
          } else if (Array.isArray(type)) {
            if (type.length === 2) {
              production.push('switch(' + type[0] + '){\n');
              for (var val in type[1]) {
                production.push('case ' + val + ':\n');
                if (typeof type[1][val] === 'object')
                  translate(type[1][val]);
                production.push('break\n');
              }
              production.push('\n}');
              expr = '$$';
            } else {

            }
          } else if (options.seamless) {
            // merge sub-properties
            var keys = Object.keys(type);
            splice.apply(props, [i, 0].concat(keys));
            // don't change the original object
            struct = Object.create(struct);
            keys.forEach(function(key) {
              struct[key] = type[key];
            });
            continue;
          } else {
            translate(type);
            expr = '$$';
          }

          var local = '$' + localCount++;
          production.push('var ' + local + '=' +
                           (options.pre || '') + expr + (options.post || ''));

          // create named references for properties with leading dollar sign
          if (prop[0] === '$') {
            prop = prop.substr(1);
            production.push('var ' + prop + '=' + local);
          }

          propValList.push(prop + ':' + local);
        }
        production.push('var $$={' + propValList.join(',') + '}');

        // cache production to speed up subsequent translations
        Object.defineProperty(struct, 'production', {
          value: production.join('\n'),
          enumerable: false
        });
      }
      productions.push(struct.production);
    })(struct);

    return new Function('$bytes,$view',
      productions.join('\n') + '\nreturn $$'
    );
  }

})(this); // end of file
