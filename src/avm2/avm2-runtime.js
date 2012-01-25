function throwConvertUndefinedToObjectError() {
    throw new TypeError("A term is undefined and has no properties.");
}
function throwConvertNullToObjectError() {
    throw new TypeError("Cannot access a property or method of a null object reference.");
}

function nullcheckfailed(v) {
    v == null ? throwConvertNullToObjectError() : throwConvertUndefinedToObjectError();
}
function nullcheck(v) {
    if (v == null || typeof v == "undefined")
	nullcheckfailed(v);
    return v;
}

function findBinding(index) {
    for (var base = this.traits; !!base; base = base.super.prototype.traits) {
        var val = base.findLocalBinding(index);
        if (val)
            return val;
    }
    return undefined;
}

function findLocalBinding(index) {
    var multiname = abc.constantPool.multinames[index];
    var traits = this.traits
    assert(!!multiname);

    /* :FIXME: Quadratic probe, super slow! */
    traits.forEach(function(t1) {
        if (t1.matches(multiname)) {
            traits.forEach(function(t2) {
                if (t1 !== t2 && t2.matches(multiname)) {
                    throw new TypeError("ambiguous binding");
                }
            });

            return this[t1];
        }
    });

    return undefined;
}