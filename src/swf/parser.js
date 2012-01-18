/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function (window, undefined) {

  'use strict';

  console.time('init');

  //////////////////////////////////////////////////////////////////////////////
  //
  // Basic Data Types
  //
  //////////////////////////////////////////////////////////////////////////////

  /** @const */ var SI8        = 0;
  /** @const */ var SI16       = 1;
  /** @const */ var SI32       = 2;
  /** @const */ var UI8        = 3;
  /** @const */ var UI16       = 4;
  /** @const */ var UI32       = 5;
  /** @const */ var FIXED      = 6;
  /** @const */ var FIXED8     = 7;
  /** @const */ var FLOAT16    = 8;
  /** @const */ var FLOAT      = 9;
  /** @const */ var DOUBLE     = 10;
  /** @const */ var EncodedU32 = 11;
  /** @const */ var SB         = 12;
  /** @const */ var UB         = 13;
  /** @const */ var FB         = 14;
  /** @const */ var STRING     = 15;
  /** @const */ var BINARY     = 16;

  /** @const */ var UI24       = 17;
  /** @const */ var TAG        = 18;
  /** @const */ var ACTION     = 19;

  /** @const */ var UB1        = 20;
  /** @const */ var UB2        = 21;
  /** @const */ var UB3        = 22;
  /** @const */ var UB4        = 23;
  /** @const */ var UB5        = 24;
  /** @const */ var UB6        = 25;
  /** @const */ var UB7        = 26;
  /** @const */ var UB8        = 27;
  /** @const */ var UB9        = 28;
  /** @const */ var UB10       = 29;
  /** @const */ var UB11       = 30;
  /** @const */ var UB12       = 31;
  /** @const */ var UB13       = 32;
  /** @const */ var UB14       = 33;
  /** @const */ var UB15       = 34;
  /** @const */ var UB16       = 35;
  /** @const */ var UB17       = 36;
  /** @const */ var FLAG       = 37;

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
    rect: {
      type: {
        $numBits: UB5,
        xMin: SB,
        xMax: SB,
        yMin: SB,
        yMax: SB
      },
      align: true,
      merge: true
    }
  };

  var MATRIX = {
    matrix: {
      type: {
        $hasScale: FLAG,
        scale: {
          type: {
            $numScaleBits: UB5,
            scaleX: {
              type: FB,
              numBits: 'numScaleBits'
            },
            scaleY: {
              type: FB,
              numBits: 'numScaleBits'
            }
          },
          merge: true,
          condition: 'hasScale'
        },
        $hasRotate: FLAG,
        rotate: {
          type: {
            $numRotateBits: UB5,
            rotateSkew0: {
              type: FB,
              numBits: 'numRotateBits'
            },
            rotateSkew1: {
              type: FB,
              numBits: 'numRotateBits'
            }
          },
          merge: true,
          condition: 'hasRotate'
        },
        $numTranslateBits: UB5,
        translateX: {
          type: SB,
          numBits: 'numTranslateBits'
        },
        translateY: {
          type: SB,
          numBits: 'numTranslateBits'
        }
      },
      align: true,
      merge: true
    }
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
    cxform: {
      type: {
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
      },
      align: true,
      merge: true
    }
  };

  var CXFORMWITHALPHA = {
    cxform: {
      type: {
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
      },
      align: true,
      merge: true
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
    colorTransform: CXFORM
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
      type: CXFORMWITHALPHA,
      condition: 'hasColorTransform'
    },
    ratio: {
      type: UI16,
      condition: 'hasRatio'
    },
    name: {
      type: STRING,
      length: undefined,
      condition: 'hasName'
    },
    clipDepth: {
      type: UI16,
      condition: 'hasClipDepth'
    }
  };

  var CLIPEVENTFLAGS = {
    $eventFlags: UB16,
    keyUp: '!!(eventFlags&32768)',
    keyDown: '!!(eventFlags&16384)',
    mouseUp: '!!(eventFlags&8192)',
    mouseDown: '!!(eventFlags&4096)',
    mouseMove: '!!(eventFlags&2048)',
    unload: '!!(eventFlags&1024)',
    enterFrame: '!!(eventFlags&512)',
    load: '!!(eventFlags&256)',
    dragOver: '!!(eventFlags&128)',
    rollOut: '!!(eventFlags&64)',
    rollOver: '!!(eventFlags&32)',
    releaseOutside: '!!(eventFlags&16)',
    release: '!!(eventFlags&8)',
    press: '!!(eventFlags&4)',
    initialize: '!!(eventFlags&2)',
    data: '!!(eventFlags&1)',
    extraEvents: {
      type: {
        $extraFlags: UB16,
        reserved: 'eventFlags>>11',
        construct: '!!(eventFlags&1024)',
        keyPress: '!!(eventFlags&512)',
        dragOut: '!!(eventFlags&256)',
        reserved2: 'eventFlags&255'
      },
      merge: true,
      condition: 'swfVersion>=6'
    }
  };

  var CLIPACTIONRECORD = {
    eventFlags: CLIPEVENTFLAGS,
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
      list: { condition: 'eventFlags||extraFlags' }
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
    highlightColor: RGBA,
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
      length: undefined,
      condition: 'hasClassName||hasImage&&hasCharacter'
    },
    info: {
      type: PLACEINFO,
      merge: true
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
    paramName: {
      type: STRING,
      length: undefined
    }
  };

  var actions = {

    /* GotoFrame */ 129: {
      frame: UI16
    },

    /* GetURL */ 131: {
      url: {
        type: STRING,
        length: undefined
      },
      target: {
        type: {
          type: STRING,
          length: undefined
        },
        length: undefined
      }
    },

    /* WaitForFrame */ 138: {
      frame: UI16,
      skipCount: UI8
    },

    /* SetTarget */ 139: {
      targetName: {
        type: STRING,
        length: undefined
      }
    },

    /* GoToLabel */ 140: {
      label: {
        type: STRING,
        length: undefined
      }
    },

    /* Push */ 150: {
      values: {
        type: {
          $valueType: UI8,
          value: {
            type: ['valueType', {
              0: {
                string: {
                  type: STRING,
                  length: undefined
                }
              },
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
          length: undefined,
          list: { count: 'count' }
        }
      },

      /* DefineFunction */ 155: {
        functionName: {
          type: STRING,
          length: undefined
        },
        $numParams: UI16,
        params: {
          type: STRING,
          length: undefined,
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
        functionName: {
          type: STRING,
          length: undefined
        },
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
          length: undefined,
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
      },

      unknown: {
        actionData: BINARY
      }

  }; // end of actions

  var ACTIONRECORD = {
    $actionCode: UI8,
    $length: {
      type: UI16,
      condition: 'actionCode>=128'
    },
    action: {
      type: ['actionCode', actions],
      size: 'length',
      merge: true,
      condition: 'length'
    }
  };

  var DOACTION = {
    actions: {
      type: ACTION,
      list: { condition: '$.actionCode' }
    }
  };

  var DOINITACTION = {
    spriteId: UI16,
    actions: {
      type: ACTION,
      list: { condition: '$.actionCode' }
    }
  };

  var DOABC = {
    flags: UI32,
    name: {
      type: STRING,
      length: undefined
    },
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
    $numStyles: 'count<255?count:countExtended',
    styles: {
      type: FILLSTYLE,
      list: { count: 'numStyles' }
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
    $numStyles: 'count<255?count:countExtended',
    styles: {
      type: ['tagCode===83', LINESTYLE, LINESTYLE2],
      list: { count: 'numStyles' }
    }
  };

  // Shape structures //////////////////////////////////////////////////////////

  var STYLECHANGERECORD = {
    $flags: UB5,
    $hasNewStyles: '!!(flags&16)',
    $hasLineStyle: '!!(flags&8)',
    $hasFillStyle1: '!!(flags&4)',
    $hasFillStyle0: '!!(flags&2)',
    $moveTo: '!!(flags&1)',
    move: {
      type: {
        $numMoveBits: UB5,
        moveDeltaX: {
          type: SB,
          numBits: 'numMoveBits'
        },
        moveDeltaY: {
          type: SB,
          numBits: 'numMoveBits'
        }
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
      align: true,
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
    $recordType: UB1,
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
      list: { condition: 'recordType||flags' }
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

  var DEFINESHAPE2 = DEFINESHAPE;

  var DEFINESHAPE3 = DEFINESHAPE;

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
    $numStyles: 'count<255?count:countExtended',
    styles: {
      type: MORPHFILLSTYLE,
      list: { count: 'numStyles' }
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
    $numStyles: 'count<255?count:countExtended',
    styles: {
      type: MORPHLINESTYLE,
      list: { count: 'numStyles' }
    }
  };

  //////////////////////////////////////////////////////////////////////////////

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
    $usesWideCodes: FLAG,
    codeTable: {
      type: ['usesWideCodes', UI8, UI16],
      list: true
    }
  };

  var DEFINEFONTINFO2 = {
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
    $usesWideOffsets: FLAG,
    $usesWideCodes: FLAG,
    isItalic: FLAG,
    isBold: FLAG,
    languageCode: LANGCODE,
    $fontNameLen: UI8,
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
      type: ['usesWideCodes', UI8, UI16],
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

  var DEFINEFONT3 = DEFINEFONT2;

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
    fontName: {
      type: STRING,
      length: undefined
    },
    copyright: {
      type: STRING,
      length: undefined
    }
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
    $flags: UB8,
    $recordType: 'flags>>7',
    reserved: 'flags>>4&7',
    $hasFont: '!!(flags&8)',
    $hasColor: '!!(flags&4)',
    $hasYOffset: '!!(flags&2)',
    $hasXOffset: '!!(flags&1)',
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
      list: { condition: 'flags' }
    }
  };

  var DEFINETEXT2 = DEFINETEXT;

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
      length: undefined,
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
    variableName: {
      type: STRING,
      length: undefined
    },
    intitialText: {
      type: STRING,
      length: undefined,
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
    fontName: {
      type: STRING,
      length: undefined
    },
    fontData: BINARY
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
    soundClassName: {
      type: STRING,
      length: undefined
    },
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

  var SOUNDSTREAMHEAD2 = SOUNDSTREAMHEAD;

  var SOUNDSTREAMBLOCK = {
    streamData: BINARY
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Buttons
  //
  //////////////////////////////////////////////////////////////////////////////

  var BUTTONRECORD = {
    $flags: UB8,
    reserved: 'flags>>4',
    stateHitTest: '!!(flags&8)',
    stateDown: '!!(flags&4)',
    stateOver: '!!(flags&2)',
    stateUp: '!!(flags&1)',
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
      type: ACTION,
      list: { condition: 'actionCode' }
    }
  };

  var BUTTONRECORD2 = {
    $flags: UB8,
    reserved: 'flags>>6',
    $hasBlendMode: '!!(flags&32)',
    $hasFilterList: '!!(flags&16)',
    stateHitTest: '!!(flags&8)',
    stateDown: '!!(flags&4)',
    stateOver: '!!(flags&2)',
    stateUp: '!!(flags&1)',
    characterId: UI16,
    depth: UI16,
    matrix: MATRIX,
    colorTransform: CXFORMWITHALPHA,
    filterList: {
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
      list: { condition: 'flags' }
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
      name: {
        type: STRING,
        length: undefined
      },
      isNamedAnchor: UI8
    },

    ///* Protect */ 24: {
    //  password: {
    //    type: STRING,
    //    length: undefined
    //  }
    //},

    /* ExportAssets */ 56: {
      $count: UI16,
      assets: {
        type: {
          tag: UI16,
          name: {
            type: STRING,
            length: undefined
          }
        },
        list: { count: 'count' }
      }
    },

    ///* ImportAssets */ 57: {
    //  url: {
    //    type: STRING,
    //    length: undefined
    //  },
    //  $count: UI16,
    //  assets: {
    //    type: {
    //      tag: UI16,
    //      name: {
    //        type: STRING,
    //        length: undefined
    //      }
    //    },
    //    list: { count: 'count' }
    //  }
    //},
    //
    ///* EnableDebugger */ 58: {
    //  password: {
    //    type: STRING,
    //    length: undefined
    //  }
    //},
    //
    ///* EnableDebugger2 */ 64: {
    //  reserved: UI16,
    //  password: {
    //    type: STRING,
    //    length: undefined
    //  }
    //},
    //
    ///* ScriptLimits */ 65: {
    //  maxRecursionDepth: UI16,
    //  scriptTimeoutSeconds: UI16
    //},
    //
    ///* SetTabIndex */ 66: {
    //  depth: UI16,
    //  tabIndex: UI16
    //},

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

    ///* ImportAssets2 */ 71: {
    //  url: {
    //    type: STRING,
    //    length: undefined
    //  },
    //  reserved: UI8,
    //  reserved2: UI8,
    //  $count: UI16,
    //  assets: {
    //    type: {
    //      tag: UI16,
    //      name: {
    //        type: STRING,
    //        length: undefined
    //      }
    //    },
    //    list: { count: 'count' }
    //  }
    //},
    //
    ///* SymbolClass */ 76: {
    //  $numSymbols: UI16,
    //  symbols: {
    //    type: {
    //      tag: UI16,
    //      name: {
    //        type: STRING,
    //        length: undefined
    //      }
    //    },
    //    list: { count: 'numSymbols' }
    //  }
    //},
    //
    ///* Metadata */ 77: {
    //  metadata: {
    //    type: STRING,
    //    length: undefined
    //  }
    //},
    //
    ///* DefineScalingGrid */ 78: {
    //  characterId: UI16,
    //  splitter: RECT
    //},

    /* DefineSceneAndFrameLabelData */ 86: {
      $sceneCount: EncodedU32,
      scenes: {
        type: {
          offset: EncodedU32,
          name: {
            type: STRING,
            length: undefined
          }
        },
        list: { count: 'sceneCount' }
      },
      $frameLabelCount: EncodedU32,
      frameLabels: {
        type: {
          frameNum: EncodedU32,
          label: {
            type: STRING,
            length: undefined
          }
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
    /* DefineShape3 */ 32: DEFINESHAPE3,
    /* DefineShape4 */ 83: DEFINESHAPE4,

    // Bitmap tags /////////////////////////////////////////////////////////////

    /* DefineBits */ 6: DEFINEBITS,
    /* JPEGTables */ 8: JPEGTABLES,
    /* DefineBitsJPEG2 */ 21: DEFINEBITSJPEG2,
    /* DefineBitsJPEG3 */ 35: DEFINEBITSJPEG3,
    ///* DefineBitsLossless */ 20: DEFINEBITSLOSSLESS,
    ///* DefineBitsLossless2 */ 36: DEFINEBITSLOSSLESS2,
    ///* DefineBitsJPEG4 */ 90: DEFINEBITSJPEG4,

    // Shape morphing tags /////////////////////////////////////////////////////

    /* DefineMorphShape */ 46: DEFINEMORPHSHAPE,
    ///* DefineMorphShape2 */ 84: DEFINEMORPHSHAPE2,

    //// Font tags /////////////////////////////////////////////////////////////
    //
    ///* DefineFont */ 10: DEFINEFONT,
    ///* DefineFontInfo */ 13: DEFINEFONTINFO,
    ///* DefineFontInfo2 */ 62: DEFINEFONTINFO2,
    /* DefineFont2 */ 48: DEFINEFONT2,
    ///* DefineFont3 */ 75: DEFINEFONT3,
    ///* DefineFontAlignZones */ 73: DEFINEFONTALIGNZONES,
    ///* DefineFontName */ 88: DEFINEFONTNAME,
    /* DefineText */ 11: DEFINETEXT,
    ///* DefineText2 */ 33: DEFINETEXT2,
    ///* DefineEditText */ 37: DEFINEEDITTEXT,
    ///* CSMTextSettings */ 74: CSMTEXTSETTINGS,
    ///* DefineFont4 */ 91: DEFINEFONT4,
    //
    //// Sound tags ////////////////////////////////////////////////////////////
    //
    ///* DefineSound */ 14: DEFINESOUND,
    ///* StartSound */ 15: STARTSOUND,
    ///* StartSound2 */ 89: STARTSOUND2,
    ///* SoundStreamHead */ 18: SOUNDSTREAMHEAD,
    ///* SoundStreamHead2 */ 45: SOUNDSTREAMHEAD2,
    ///* SoundStreamBlock */ 19: SOUNDSTREAMBLOCK,
    //
    //// Button tags ///////////////////////////////////////////////////////////
    //
    ///* DefineButton */ 7: DEFINEBUTTON,
    ///* DefineButton2 */ 34: DEFINEBUTTON2,
    ///* DefineButtonCxform */ 23: DEFINEBUTTONCXFORM,
    ///* DefineButtonSound */ 17: DEFINEBUTTONSOUND,

    // Movie clips /////////////////////////////////////////////////////////////

    /* DefineSprite */ 39: {
      id: UI16,
      frameCount: UI16,
      controlTags: {
        type: TAG,
        list: { condition: '$.tagCode' }
      }
    },

    //// Video tags ////////////////////////////////////////////////////////////
    //
    ///* DefineVideoStream */ 60: DEFINEVIDEOSTREAM,
    ///* VideoFrame */ 61: VIDEOFRAME,
    //
    //// Binary data ///////////////////////////////////////////////////////////
    //
    ///* DefineBinaryData */ 87: {
    //  characterId: UI16,
    //  reserved: UI32,
    //  binaryData: BINARY
    //},
    //
    ////////////////////////////////////////////////////////////////////////////

    unknown: {
      tagData: BINARY
    }

  }; // end of tags

  var TAGRECORD = {
    $tagCodeAndLength: UI16,
    $tagCode: 'tagCodeAndLength>>6',
    $length: ['(tagCodeAndLength&63)<63', UI32, 'tagCodeAndLength&63'],
    tag: {
      type: ['tagCode', tags],
      size: 'length',
      merge: true,
      condition: 'length'
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
    frameRate: {
      type: UI16,
      post: '/256'
    },
    frameCount: UI16,
    tags: {
      type: TAG,
      list: { condition: '$.tagCode' }
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
        frameRate: {
          type: UI16,
          post: '/256'
        },
        frameCount: UI16,
        tags: {
          type: TAG,
          list: { condition: '$.tagCode' }
        }
      },
      compressed: true,
      merge: true
    }
  };


  //////////////////////////////////////////////////////////////////////////////
  //
  // Parser
  //
  //////////////////////////////////////////////////////////////////////////////

  // Utils /////////////////////////////////////////////////////////////////////

  var max = Math.max;
  var splice = [].splice;
  var pow = Math.pow;
  var slice = [].slice;
  var fromCharCode = String.fromCharCode;
  var isArray = Array.isArray;

  function fail(msg) {
    throw new Error(msg);
  }

  function createStream(bytes) {
    var stream = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    stream.pos = 0;
    stream.bitBuffer = 0;
    stream.bitLength = 0;
    return stream;
  }

  // Fixed deflate code tables /////////////////////////////////////////////////

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

  // Inflate ///////////////////////////////////////////////////////////////////

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
    var bufflen = inBuffer.length;
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

  // Parsing templates /////////////////////////////////////////////////////////

  function readSi8($bytes, $stream) {
    return $stream.getInt8($stream.pos++);
  }
  function readSi16($bytes, $stream) {
    return $stream.getInt16($stream.pos, $stream.pos += 2);
  }
  function readSi32($bytes, $stream) {
    return $stream.getInt32($stream.pos, $stream.pos += 4);
  }
  function readUi8($bytes, $stream) {
    return $bytes[$stream.pos++];
  }
  function readUi16($bytes, $stream) {
    return $stream.getUint16($stream.pos, $stream.pos += 2);
  }
  function readUi24($bytes, $stream) {
    return $stream.getUint16($stream.pos, $stream.pos += 2) |
           ($bytes[$stream.pos++] << 16);
  }
  function readUi32($bytes, $stream) {
    return $stream.getUint32($stream.pos, $stream.pos += 4);
  }
  function readFixed($bytes, $stream) {
    return readSi32($bytes, $stream) / 65536;
  }
  function readFixed8($bytes, $stream) {
    return readSi16($bytes, $stream) / 255;
  }
  function readFloat16($bytes, $stream) {
    var bits = readUb($bytes, $stream, 16);
    var sign = bits >> 15 ? -1 : 1;
    var exponent = (bits & 0x7c00) >> 10;
    var fraction = bits & 0x03ff;
    if (!exponent)
      return sign * pow(2, -14) * (fraction / 1024);
    if (exponent === 0x1f)
      return fraction ? NaN : sign * Infinity;
    return sign * pow(2, exponent - 15) * (1 + (fraction / 1024));
  }
  function readFloat($bytes, $stream) {
    return $stream.getFloat32($stream.pos, $stream.pos += 4);
  }
  function readDouble($bytes, $stream) {
    return $stream.getFloat64($stream.pos, $stream.pos += 4);
  }
  function readEncodedU32($bytes, $stream) {
    var val = 0;
    for (var i = 0; i < 5; ++i) {
      var b = $bytes[$stream.pos++];
      val = val | ((b & 0x7f) << (7 * i));
      if (!(b & 0x80))
        break;
    }
    return val;
  }
  function readSb($bytes, $stream, numBits) {
    return (readUb($bytes, $stream, numBits)
           << (32 - numBits)) >> (32 - numBits);
  }
  function readUb($bytes, $stream, numBits) {
    var buffer = $stream.bitBuffer;
    var bitlen = $stream.bitLength;
    while (numBits > bitlen) {
      buffer = (buffer << 8) | $bytes[$stream.pos++];
      bitlen += 8;
    }
    var val = 0;
    var i = numBits;
    while (i--)
      val = (val << 1) | ((buffer >> --bitlen) & 1);
    $stream.bitBuffer = buffer;
    $stream.bitLength = bitlen;
    return val >>> 0;
  }
  function readFb($bytes, $stream, numBits) {
    return readUb($bytes, $stream, numBits) * pow(2, -16);
  }
  function readString($bytes, $stream, length) {
    var codes = [];
    if (length) {
      codes = slice.call($bytes, $stream.pos, $stream.pos += length);
    } else {
      var code;
      var i = 0;
      while (code = $bytes[$stream.pos++])
        codes[i++] = code;
    }
    var numChunks = codes.length / 65536;
    var str = '';
    for (var i = 0; i < numChunks; ++i) {
      var s = codes.slice(i * 65536, (i + 1) * 65536);
      str += fromCharCode.apply(null, s);
    }
    return decodeURIComponent(escape(str.replace('\0', '', 'g')));
  }
  function readBinary($bytes, $stream) {
    return $bytes.subarray($stream.pos);
  }

  var defaultTemplateSet = [
    readSi8, readSi16, readSi32, readUi8, readUi16, readUi32,
    readFixed, readFixed8, readFloat16, readFloat, readDouble,
    readEncodedU32,
    readSb, readUb, readFb, readString, readBinary,
    readUi24,
    'readTag($bytes,$stream,swfVersion)',
    'readAction($bytes,$stream,swfVersion)'
  ];

  // Parser generator //////////////////////////////////////////////////////////

  var firstLineIndex = (function(){} + '').split('\n').length > 1 ? 1 : 0;

  function generate(struct, templateSet) {
    if (!templateSet)
      templateSet = defaultTemplateSet;

    var varCount = 0;

    function translate(type, options) {
      if (translate[type])
        return translate[type];
      var template = templateSet[type];
      if (typeof template === 'function') {
        var funcTerms =
          /^function (.*)\(([^\)]*)\).*{\n?([.\s\S]*)\n?}$/.exec(template);
        var name = funcTerms[1];
        var params = funcTerms[2].split(', ');
        var lines = funcTerms[3].split('\n');
        var isSimple = params.length === 2;
        var inline = true;
        var expr;
        if (!isSimple) {
          for (var i = 2, p; p = params[i]; i++) {
            if (p in options) {
              params[i] = options[p] + '';
              inline = false;
            }
          }
        }
        if (inline && /^\s*return ([^;]*);$/.test(lines[firstLineIndex]))
          expr = RegExp.$1;
        else
          expr = name + '(' + params.join(',') + ')';
        if (isSimple)
          translate[type] = expr;
        return expr;
      }
      return template;
    }

    var body = (function process(struct) {
      if (struct.__production__)
        return struct.__production__;
      var production = '';
      var propValList = [];
      var dumpLiteral = true;
      if (typeof struct !== 'object' || 'type' in struct) {
        struct = { $$: struct };
        dumpLiteral = false;
      }
      var props = Object.keys(struct);
      for (var i = 0, prop; prop = props[i++];) {
        var type = struct[prop];
        var options = { };
        var segment = '';
        var expr = type;
        if (typeof type === 'object' && 'type' in type) {
          options = type;
          type = type.type;
        }
        if (typeof type === 'number') {
          if (type >= UB1 && type <= FLAG) {
            if (type === FLAG) {
              options.numBits = 1;
              options.pre = '!!';
            } else {
              options.numBits = type - 19;
            }
            type = UB;
          }
          expr = translate(type, options);
          if (options.condition)
            expr = '(' + options.condition + ')?' + expr + ':undefined';
        } else if (typeof type === 'object') {
          if (isArray(type)) {
            if (type.length === 3) {
              segment += 'if(' + type[0] + '){';
              segment += process(type[2]);
              segment += '}else{'
              segment += process(type[1]);
              segment += '}';
            } else {
              var members = type.length === 2 ? type[1] : type.slice(1);
              segment += 'switch(' + type[0] + '){';
              var keys = Object.keys(members);
              for (var j = 0, key; (key = keys[j++]) !== undefined;) {
                var member = members[key];
                if (key !== 'unknown' && member != undefined) {
                  segment += 'case ' + key + ':';
                  if (member !== members[keys[j]]) {
                    segment += process(member);
                    segment += 'break;';
                  }
                }
              }
              segment += 'default:' + (
                'unknown' in members ? process(members.unknown) : '$=undefined'
              );
              segment += '}';
            }
            options.merge = false;
            expr = '$';
          } else if (options.merge) {
            var results = /^(.*)\$ ?= ?{(.*)};$/.exec(process(type));
            segment += results[1];
            propValList.push(results[2]);
          } else {
            segment += process(type);
            expr = '$';
          }
          if (options.align)
            segment += '$stream.bitBuffer=$stream.bitLength=0;';
          if (options.size) {
            var bytesVar = '$' + varCount++;
            var streamVar = '$' + varCount++;
            var init = 'var ' + bytesVar + '=$bytes;';
            init += 'var ' + streamVar + '=$stream;';
            init += '$bytes=$bytes.subarray($stream.pos,$stream.pos+=(' +
                    options.size + '));';
            init += '$stream=createStream($bytes);';
            segment = init + segment;
            segment += '$bytes=' + bytesVar + ';';
            segment += '$stream=' + streamVar + ';';
          }
          if (options.condition) {
            segment = 'if(' + options.condition + '){' + segment;
            segment += '}';
            if (!options.merge)
              segment += 'else{$=undefined}';
          }
        }
        if (!options.merge) {
          if (prop[0] === '$') {
            prop = prop.substr(1);
            var tmpVar = prop;
          } else {
            var tmpVar = '$' + varCount++;
          }
          segment += 'var ' + tmpVar + '=';
          segment += options.pre || '';
          segment += expr;
          segment += options.post || '';
          segment += ';';
          if (options.list) {
            var args = options.list;
            var listVar = '$' + varCount++;
            var header = 'var ' + listVar + '=[];';
            var footer = '}';
            if (args.condition) {
              header += 'do{';
              footer += 'while(' + args.condition + ')';
            } else if (args.count) {
              var loopVar = '$' + varCount++;
              header += 'var ' + loopVar + '=' + args.count;
              header += ';while(' + loopVar + '--){';
            } else {
              var endVar = '$' + varCount++;
              header += 'var ' + endVar + '=';
              if (args.length)
                header += '$bytes.pos+' + args.length;
              else
                header += '$stream.byteLength';
              header += ';while($stream.pos<' + endVar + '){';
            }
            segment = header + segment;
            segment += listVar + '.push($=' + tmpVar + ')';
            segment += footer;
            tmpVar = listVar;
          }
          propValList.push(prop + ':' + tmpVar);
        }
        production += segment;
      }
      if (dumpLiteral)
        production += '$={' + propValList.join(',') + '};';
      return struct.__production__ = production;
    })(struct);

    return eval(
      '(function($bytes,$stream,swfVersion){' +
        'var $;' +
        body +
      'return $})'
    );
  }

  //////////////////////////////////////////////////////////////////////////////

  console.timeEnd('init');
  console.time('generate');

  var readTag = generate(TAGRECORD);
  var readAction = generate(ACTIONRECORD);
  var readSwf = generate(SWFFILE);

  console.timeEnd('generate');

  function parse(buffer) {
    var bytes = new Uint8Array(buffer);
    var b1 = bytes[0];
    var b2 = bytes[1];
    var b3 = bytes[2];
    var compressed = bytes[0] === 67;

    if (!((b1 === 70 || compressed) && b2 === 87 && b3 === 83))
      fail('invalid swf data');
    if (compressed)
      fail('compressed swf data is not supported yet');

    var stream = createStream(bytes);

    console.time('parse');
    //console.profile();

    var result = readSwf(bytes, stream);

    //console.profileEnd();
    console.timeEnd('parse');
    console.dir(result);

    return result;
  }

  //////////////////////////////////////////////////////////////////////////////

  (window.SWF || (window.SWF = { })).parse = parse;

})(this); // end of file
