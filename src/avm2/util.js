function error(message) {
    throw new Error(message);
}

function assert(condition, message) {
    if (!condition) {
        error(message);
    }
}

function assertFalse(condition, message) {
    if (condition) {
        error(message);
    }
}

function warning(message) {
    console.warn(message);
}