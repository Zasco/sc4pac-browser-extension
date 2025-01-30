import BaseExchangeHelper from "./BaseExchangeHelper.js";

export default {
    ...BaseExchangeHelper,

    EXCHANGE_ID: 'sc4e',
    EXCHANGE_HOSTNAME: 'www.sc4evermore.com',
    EXCHANGE_BASE_FILE_URL: 'https://www.sc4evermore.com/index.php/downloads/download/',
    EXCHANGE_PACKAGE_LIST_URL: 'https://github.com/sebamarynissen/sc4pac-helpers/blob/main/lib/data/sc4e.js',

    BSC_PACKAGE_LIST_URL: 'https://github.com/sebamarynissen/sc4pac-helpers/blob/main/lib/data/deps-bsc.js',
    GIRAFE_PACKAGE_LIST_URL: 'https://github.com/sebamarynissen/sc4pac-helpers/blob/main/lib/data/deps-girafe.js',

    /**
     * Extracts and returns the integer ID from a package full ID.
     * @param {string} fullId - The package full ID.
     * @returns {number} The integer package ID.
     * @throws {Error} If no valid ID format is found.
     */
    getIntIdFromFullId(fullId) {
        // Handle both "123" and "123-text" formats
        const match = fullId.match(/^(\d+)(?:-.*)?$/);
        if (match) {
            return parseInt(match[1], 10);
        }
        throw new Error(`Invalid SC4E package ID format: "${fullId}". Expected format: "number" or "number-text"`);
    },

    /**
     * Extracts and returns the string part of a package full ID.
     * @param {string} fullId - The package full ID.
     * @returns {string} The string part of the package ID.
     * @throws {Error} If no valid ID format is found.
     */
    getStringIdFromFullId(fullId) {
        // Handle both "123" and "123-text" formats
        const match = fullId.match(/^\d+(?:-(.+))?$/);
        if (match) {
            // Return empty null for number-only format
            return match[1] || null;
        }
        throw new Error(`Invalid SC4E package ID format: "${fullId}". Expected format: "number" or "number-text"`);
    },

    /**
     * Returns the selector for the SC4E package title element.
     * @returns {string} The CSS selector for the title element.
     */
    getTitleSelector() {
        return '.jd_title_left h5';
    },

    /**
     * Returns the selector for the SC4E package description element.
     * @returns {string} The CSS selector for the description element.
     */
    getDescriptionSelector() {
        return '.jd_description_wrapper.jd_clear';
    },
}