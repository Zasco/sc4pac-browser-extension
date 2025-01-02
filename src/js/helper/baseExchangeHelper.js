const baseExchangeHelper = {
    // The sc4pac packages that are hosted on this exchange.
    packages: {},

    /**
     * Returns the packages available on this exchange.
     * @returns {Promise<Object>} The exchange packages.
     */
    async getPackages() {
        if (Object.keys(this.packages).length > 0) {
            return this.packages;
        }
        
        this.packages = await exchangeHelper.getPackagesForExchange(this.EXCHANGE_ID);
        return this.packages;
    },

    /**
     * Gets the description text of the main package.
     * @returns {string} The package description without HTML formatting.
     * @throws {Error} If the description element is not found.
     */
    getMainPackageDescription() {
        const element = document.querySelector(this.getDescriptionSelector());
        if (!element) {
            throw new Error('Description element not found.');
        }
        return element.textContent.trim();
    },

    /**
     * Checks if a file is supported by the exchange and is in a channel listed in the settings.
     * @param {string} fileIntId - The file integer ID to check.
     * @returns {Promise<boolean>} True if the file is supported and in a listed channel, false otherwise.
     */
    async isSupportedFile(fileIntId) {
        const packages = await this.getPackages();
        if (!packages || !exchangeHelper.fileIsInPackageList(fileIntId, packages)) {
            return false;
        }
        
        const packageId = packages[fileIntId];
        return channelHelper.packageHasChannel(packageId);
    },

    /**
     * Returns if the buttons are displayed for a specific file.
     * @param {string} fileIntId - The file integer ID to check.
     * @returns {Promise<boolean>} True if the buttons are displayed, false otherwise.
     */
    async buttonsAreDisplayed(fileIntId) {
        return await this.isSupportedFile(fileIntId) 
            // And there is not multiple packages registered to this file.
            && !Array.isArray((await this.getPackages())[fileIntId])
        ;
    },

    /**
     * Adds sc4pac buttons to the main package title.
     */
    async insertMainButtons() {
        const selector = this.getTitleSelector();
        const titleElement = document.querySelector(selector);
        if (!titleElement) return;
        
        const mainFileFullId = this.extractFileFullIdFromUrl(window.location.href);
        const mainFileIntId = this.getIntIdFromFullId(mainFileFullId);
        const packageId = (await this.getPackages())[mainFileIntId];
        
        if (this.buttonsAreDisplayed(mainFileIntId)) {
            this.adjustTitleElement(titleElement);
            titleElement.appendChild(buttonHelper.createButtonGroup(packageId, 'main-buttons'));
        }
    },

    /**
     * Adjusts the title element if needed.
     * @param {Element} element - The title element to adjust.
     */
    adjustTitleElement(element) {
        // Default implementation does nothing
    },

    /**
     * Extracts a file full ID from a file URL.
     * @param {string} fileUrl - The file URL to extract the full ID from.
     * @returns {string} The extracted file full ID.
     */
    extractFileFullIdFromUrl(fileUrl) {
        const urlObj = new URL(fileUrl);
        // Remove empty segments.
        const segments = urlObj.pathname.split('/').filter(segment => segment);
        // Select the last segment without the query parameters as the file full ID.
        const fileFullId = segments[segments.length - 1].split('?')[0];
    
        if (!fileFullId) {
            throw new Error('No file ID found in URL: ', fileUrl);
        }
        
        return fileFullId;
    },
};