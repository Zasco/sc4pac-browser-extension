import Logger from "./Logger.js";

import sc4pacHelper from "./helper/sc4pacHelper.js";
import ExchangeHelper from "./helper/ExchangeHelper.js";
import stHelper from "./helper/stHelper.js";
import sc4eHelper from "./helper/sc4eHelper.js";
import ButtonHelper from "./helper/ButtonHelper.js";

export default {
    /**
     * Get the log prefix for the extension.
     * @returns {string} The log prefix for the extension.
     */
    getLogPrefix() {
        return '[%bsc4pac browser extension%b]: ';
    },
    
    async boot() {
        this.log('info', 'Booting.')
    
        if (!await sc4pacHelper.serverIsRunning()) {
            this.log('warn', `Not loading as no sc4pac server available on ${await sc4pacHelper.getServerUrl()}. Please start server or adjust settings.`)
            return;
        }
        this.log('info', `sc4pac server available at ${await sc4pacHelper.getServerUrl()}.`);
        
        const hostname = window.location.hostname;
        let exchangeId;
    
        if (!ExchangeHelper.isHostnameSupported(hostname)) return;
        
        this.log('info', `%b${hostname}%b is a supported exchange.`)
    
        try {
            exchangeId = ExchangeHelper.getExchangeIdForHostname(hostname);
        } catch (error) {
            this.oldLog('error', error.message);
            return;
        }
    
        this.log('info', `Loading with detected exchange: %b${exchangeId}%b`);
    
        let siteHelper;
        // Get the appropriate helper for the current exchange
        switch (exchangeId) {
            case stHelper.EXCHANGE_ID:
                siteHelper = stHelper;
                break;
            case sc4eHelper.EXCHANGE_ID:
                siteHelper = sc4eHelper;
                break;
            default:
                this.log('warn', 'Exchange not supported.');
                return;
        }
    
        ButtonHelper.init(siteHelper);
        
        // Get the file ID from the current URL
        const fullId = siteHelper.extractFileFullIdFromUrl(window.location.href);
        this.log('info', `File ID: %b${fullId}%b`);
        const fileIntId = siteHelper.getIntIdFromFullId(fullId);
        
        // Check if the file is supported (available in any listed channel).
        // TO-DO: Add check for local configuration not to add useless buttons (add "add" if not added, "remove" otherwise.).
        if (await siteHelper.isSupportedFile(fileIntId)) {
            this.log('info', 'File is supported, inserting sc4pac extension buttons.')
            // Add the main buttons to the page
            siteHelper.insertMainButtons();
        }
        else {
            this.log('warn', 'File not supported.');
        }
    },
    
    /**
     * A proxy to log a message with the extension prefix to console.
     * @param {string} type The type of log message.
     * @param {string} message The message to log.
     * @param {string} [content] The content to log (optional).
     * @returns {boolean} True if the log was successful, false otherwise.
     */
    log(type, message, content) {
        let prefix = this.getLogPrefix();
        if (type === 'debug') prefix += '(debug) ';
        return Logger.log(type, prefix + message, content);
    },
}