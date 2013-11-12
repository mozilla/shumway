tessellate = (function() {

var c_tessellate = Module.cwrap('tessellate', 'void', ['number', 'number', 'number', 
                                                       'number', 'number', 'number']);
var tessellate = function(loops)
{
    var i;
    if (loops.length === 0)
        throw "Expected at least one loop";

    var vertices = [];
    var boundaries = [0];

    for (var l=0; l<loops.length; ++l) {
        var loop = loops[l];
        if (loop.length % 2 !== 0)
            throw "Expected even number of coordinates";
        vertices.push.apply(vertices, loop);
        boundaries.push(vertices.length);
    }

    var p = Module._malloc(vertices.length * 8);

    for (i=0; i<vertices.length; ++i)
        Module.setValue(p+i*8, vertices[i], "double");

    var contours = Module._malloc(boundaries.length * 4);
    for (i=0; i<boundaries.length; ++i)
        Module.setValue(contours + 4 * i, p + 8 * boundaries[i], 'i32');

    var ppcoordinates_out = Module._malloc(4);
    var pptris_out = Module._malloc(4);
    var pnverts = Module._malloc(4);
    var pntris = Module._malloc(4);

    c_tessellate(ppcoordinates_out, pnverts, pptris_out, pntris, 
                 contours, contours+4*boundaries.length);

    var pcoordinates_out = Module.getValue(ppcoordinates_out, 'i32');
    var ptris_out = Module.getValue(pptris_out, 'i32');

    var nverts = Module.getValue(pnverts, 'i32');
    var ntris = Module.getValue(pntris, 'i32');

    var result_vertices = new Float64Array(nverts * 2);
    var result_triangles = new Int32Array(ntris * 3);

    for (i=0; i<2*nverts; ++i) {
        result_vertices[i] = Module.getValue(pcoordinates_out + i*8, 'double');
    }
    for (i=0; i<3*ntris; ++i) {
        result_triangles[i] = Module.getValue(ptris_out + i*4, 'i32');
    }
    Module._free(pnverts);
    Module._free(pntris);
    Module._free(ppcoordinates_out);
    Module._free(pptris_out);
    Module._free(pcoordinates_out);
    Module._free(ptris_out);
    Module._free(p);
    Module._free(contours);
    return {
        vertices: result_vertices,
        triangles: result_triangles
    };
};

return tessellate;

})();
