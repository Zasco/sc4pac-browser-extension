(async function() {
    const browserAPI = globalThis.browser ?? globalThis.chrome;
    const ExtensionKernel = await import(browserAPI.runtime.getURL('js/ExtensionKernel.js'));
    ExtensionKernel.default.boot();
})();