const executeGetCall = function executeGetCall(getFunction, url) {
    return getFunction(url).json;
}

export {executeGetCall}