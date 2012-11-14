var PointDefinition = (function () {
  var def = {
    __class__: 'flash.geom.Point',

    __glue__: {
      script: {
        static: scriptProperties("public", ["interpolate",
                                            "distance",
                                            "polar"]),
        instance: scriptProperties("public", ["x",
                                              "y",
                                              "length",
                                              "offset",
                                              "interpolate",
                                              "subtract",
                                              "add",
                                              "normalize"])
      }
    }
  };

  return def;
}).call(this);
