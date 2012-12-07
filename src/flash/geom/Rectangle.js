var RectangleDefinition = (function () {
  var def = {
    __class__: 'flash.geom.Rectangle',

    __glue__: {
      script: {
        instance: scriptProperties("public", ["x",
                                              "y",
                                              "width",
                                              "height",
                                              "left",
                                              "right",
                                              "top",
                                              "bottom",
                                              "topLeft",
                                              "bottomRight",
                                              "size",
                                              "isEmpty",
                                              "setEmpty",
                                              "inflate",
                                              "inflatePoint",
                                              "offset",
                                              "offsetPoint",
                                              "contains",
                                              "containsPoint",
                                              "containsRect",
                                              "intersection",
                                              "intersects",
                                              "union",
                                              "equals"])
      }
    }
  };

  return def;
}).call(this);
