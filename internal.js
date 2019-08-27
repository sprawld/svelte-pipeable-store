
function noop() { }
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function has_cancel(value) {
    return value && typeof value === 'object' && typeof value.cancel === 'function';
}

export { noop, run_all, is_function, safe_not_equal, is_promise, has_cancel };
