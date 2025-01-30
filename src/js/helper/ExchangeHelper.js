const exchangeHelper = {
    /**
     * Function to get exchange ID from hostname
     * @param {string} hostname - The hostname to get the exchange ID for.
     * @returns {string} The exchange ID.
     * @throws {Error} If the exchange is not supported.
     */
    getExchangeIdForHostname(hostname) {
        let helper = null
        switch (hostname) {
            case stHelper.EXCHANGE_HOSTNAME:
                helper = stHelper;
                break;
            case sc4eHelper.EXCHANGE_HOSTNAME:
                helper = sc4eHelper;
                break;
            default:
                throw new Error('Exchange not supported for hostname: ' + hostname);
        }
        return helper.EXCHANGE_ID
    },

    /**
     * Returns the packages for a specific exchange.
     * @param {string} exchangeId - The ID of the exchange to get the packages for.
     * @returns {Object} The exchange packages.
     */
    async getPackagesForExchange(exchangeId) {
        try {
            const url = this.getPackageListUrlForExchange(exchangeId);
            const exchangeEntries = await this.getPackagesFromUrl(url);

            if (exchangeId === 'sc4evermore') {
                const subLists = [
                    {
                        id: 3,
                        url: sc4eHelper.BSC_PACKAGE_LIST_URL
                    },
                    {
                        id: 27, 
                        url: sc4eHelper.GIRAFE_PACKAGE_LIST_URL
                    }
                ];

                await Promise.allSettled(subLists.map(async ({id, url}) => {
                    try {
                        const content = await this.getPackagesFromUrl(url);
                        if (content && content.length > 0) {
                            exchangeEntries[id] = content;
                        } else {
                            delete exchangeEntries[id];
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch package list for ID ${id}: ${error.message}`);
                        delete exchangeEntries[id];
                    }
                }));
            }
            return exchangeEntries;
        } catch (error) {
            console.error(`Error fetching packages for exchange "${exchangeId}": ${error.message}`);
        }
    },

    /**
     * Function to get the content for a specific correlation source URL
     * @param {string} url - The URL to get packages for.
     * @returns {Promise<Object|Array>} The exchange entries.
     * @throws {Error} If there is an error fetching the module or parsing the data.
     */
    async getPackagesFromUrl(url) {
        try {
            sebaHelper.checkIsValidListUrl(url);
            const jsDelivrUrl = new URL(sebaHelper.convertToJsDelivrUrl(url));
            const response = await fetch(jsDelivrUrl.toString());
            if (!response.ok) {
                throw new Error(`Failed to fetch the module: ${response.statusText}`);
            }
            let text = await response.text();

            const dataMatches = text.match(/export\s+default\s+(\[[\s\S]*\]|{[\s\S]*});/);
            if (!dataMatches) {
                throw new Error("Failed to extract the data from the module content");
            }

            let dataString = dataMatches[1];
            let data = sebaHelper.evalString(dataString);

            if (Array.isArray(data)) {
                return data;
            }

            const exchangeEntries = Object.entries(data).reduce((acc, [key, value]) => {
                if (typeof value === 'string' || Array.isArray(value)) {
                    acc[key] = value;
                    if (!/^\d+$/.test(key)) {
                        console.warn(`Non-numeric key found: ${key}`);
                    }
                }
                return acc;
            }, {});

            return exchangeEntries;
        } catch (error) {
            console.error(`Error fetching the module: ${error.message}`);
        }
    },

    /**
     * Function to get package list URL for a specific exchange
     * @param {string} exchangeId - The exchange to get the package list URL for.
     * @returns {string} The package list URL.
     * @throws {Error} If the exchange is not supported or the package list URL is not defined.
     */
    getPackageListUrlForExchange(exchangeId) {
        let helper = null
        switch (exchangeId) {
            case stHelper.EXCHANGE_ID:
                helper = stHelper;
                break;
            case sc4eHelper.EXCHANGE_ID:
                helper = sc4eHelper;
                break;
            default:
                throw new Error('No exchange with ID: ' + exchangeId +' supported.');
        }
        return helper.EXCHANGE_PACKAGE_LIST_URL
    },

    /**
     * Checks if the given hostname is supported.
     * @param {string} hostname - The hostname to verify.
     * @returns {boolean} True if supported, false otherwise.
     */
    isHostnameSupported(hostname) {
        switch (hostname) {
            case stHelper.EXCHANGE_HOSTNAME:
            case sc4eHelper.EXCHANGE_HOSTNAME:
                return true;
            default:
                return false;
        }
    },

    /**
     * Checks if a file ID exists in the file list.
     * @param {int} packageId - The file ID of the package to check.
     * @param {Object} packages - The object containing package information.
     * @returns {boolean} True if the package exists in the list, false otherwise.
     */
    fileIsInPackageList(packageId, packages) {
        try {
            return packageId && packages.hasOwnProperty(packageId);
        } catch (error) {
            console.error(`Error checking file list: ${error.message}`);
            return false;
        }
    },
}