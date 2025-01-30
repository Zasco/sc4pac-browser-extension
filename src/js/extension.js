(async function() {
    const browserAPI = globalThis.browser ?? globalThis.chrome;
    const ExtensionKernel = await import(browserAPI.runtime.getURL('src/js/ExtensionKernel.js'));
    ExtensionKernel.default.boot();
})();