var ColorTransformDefinition = (function () {
  var def = {
    __class__: 'flash.geom.ColorTransform',

    __glue__: {
      script: {
        instance: scriptProperties("public", ["redMultiplier",
                                              "greenMultiplier",
                                              "blueMultiplier",
                                              "alphaMultiplier",
                                              "redOffset",
                                              "greenOffset",
                                              "blueOffset",
                                              "alphaOffset",
                                              "color",
                                              "concat"])
      }
    }
  };

  return def;
}).call(this);
