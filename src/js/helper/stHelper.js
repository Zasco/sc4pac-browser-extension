const stHelper = {
    ...baseExchangeHelper,

    EXCHANGE_ID: 'st',
    EXCHANGE_HOSTNAME: 'community.simtropolis.com',
    EXCHANGE_BASE_FILE_URL: 'https://community.simtropolis.com/files/file/',
    EXCHANGE_PACKAGE_LIST_URL: 'https://github.com/sebamarynissen/sc4pac-helpers/blob/main/lib/data/st.js',

    /**
     * Extracts and returns the first sequence of digits from a package full ID as an integer.
     * @param {string} fullId - The package full ID.
     * @returns {number} The first sequence of digits as a package integer ID.
     * @throws {Error} If no digits are found in the provided fullId.
     */
    getIntIdFromFullId(fullId) {
        const match = fullId.match(/\d+/);
        if (match) {
            return parseInt(match[0], 10);
        }
        throw new Error(`Invalid ST package ID: "${fullId}". Expected format: "number-text"`);
    },

    /**
     * Extracts and returns the string part of a package full ID.
     * @param {string} fullId - The package full ID.
     * @returns {string} The string part of the package ID.
     * @throws {Error} If no valid ID format is found.
     */
    getStringIdFromFullId(fullId) {
        const match = fullId.match(/\d+-(.*)/);
        if (match) {
            return match[1];
        }
        throw new Error(`Invalid ST package ID format: "${fullId}". Expected format: "number-text"`);
    },

    /**
     * Returns the selector for the Simtropolis package title element.
     * @returns {string} The CSS selector for the title element.
     */
    getTitleSelector() {
        return 'h1.ipsType_pageTitle.ipsContained_container';
    },

    /**
     * Returns the selector for the Simtropolis package description element.
     * @returns {string} The CSS selector for the description element.
     */
    getDescriptionSelector() {
        return '.ipsType_normal.ipsSpacer_top';
    },

    /**
     * Adjusts the Simtropolis title element display.
     * @param {Element} element - The title element to adjust.
     * @returns {void}
     */
    adjustTitleElement(element) {
        element.querySelector('.ipsType_break.ipsContained').style.width = 'auto';
    },
}