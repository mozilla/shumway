var MatrixDefinition = (function () {
  var def = {
    __class__: 'flash.geom.Matrix',

    __glue__: {
      script: {
        instance: scriptProperties("public", ["a",
                                              "b",
                                              "c",
                                              "d",
                                              "tx",
                                              "ty",
                                              "concat",
                                              "invert",
                                              "identity",
                                              "createBox",
                                              "createGradientBox",
                                              "rotate",
                                              "translate",
                                              "scale",
                                              "deltaTransformPoint",
                                              "transformPoint",
                                              "setTo"])
      }
    }
  };

  return def;
}).call(this);
