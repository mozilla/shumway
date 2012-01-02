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
