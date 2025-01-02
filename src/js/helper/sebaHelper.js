const sebaHelper = {
    /**
     * Converts a string containing a JS object or array notation to its corresponding JavaScript object or array
     * @param {string} objString - String containing object or array notation (can handle single quotes, unquoted properties)
     * @returns {Object|Array} Parsed JavaScript object or array
     * @throws {Error} If string cannot be converted to valid JSON or parsed
     */
    evalString(objString) {
        try {
            return JSON.parse(objString);
        } catch (e) {
            let correctedString = objString;
            try {
                // Replace single quotes with double quotes
                correctedString = objString.replace(/'/g, '"');
                
                // Quote all values (including numbers) after colons that aren't already quoted
                correctedString = correctedString.replace(/:\s*([^",\s{}[\]]+)(?=\s*[,}])/g, ': "$1"');
                
                // Fix property names that aren't properly quoted
                correctedString = correctedString.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
                
                // Handle trailing commas
                correctedString = correctedString.replace(/,\s*([}\]])/g, '$1');
            } catch (error) {
                throw new Error('Could not convert object string to valid JSON: ' + error.message);
            }

            try {
                return JSON.parse(correctedString);
            } catch (error) {
                throw new Error('Could not parse object JSON string to valid object: ' + error.message);
            }
        }
    },

    /**
     * Converts a GitHub URL to a jsDelivr URL
     * @param {string} originalUrl - The original GitHub URL to convert.
     * @returns {string} The converted jsDelivr URL.
     * @throws {Error} If the original URL is invalid.
     */
    convertToJsDelivrUrl(originalUrl) {
        const githubBase = 'https://github.com/';
        const jsDelivrBase = 'https://cdn.jsdelivr.net/gh/';

        if (!originalUrl.startsWith(githubBase)) {
            throw new Error('Invalid GitHub URL');
        }

        const path = originalUrl.replace(githubBase, '').replace('/blob/', '@');
        return `${jsDelivrBase}${path}`;
    },

    /**
     * Validates the sc4pac-helpers URL
     * @param {string} url - The URL to validate.
     * @throws {Error} If the URL is invalid.
     */
    checkIsValidListUrl(url) {
        const validBaseUrl = 'https://github.com/sebamarynissen/sc4pac-helpers/blob/main/lib/data/';
        if (!url.startsWith(validBaseUrl)) {
            throw new Error('Invalid URL: Must be a file in the /lib/data directory of the sebamarynissen/sc4pac-helpers repository on the main branch.');
        }
    },
}