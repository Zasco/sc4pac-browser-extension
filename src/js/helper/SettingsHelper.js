const SettingsHelper = {
    SETTINGS: {
        SERVER_HOSTNAME: 'server-hostname',
        SERVER_PORT: 'server-port',
        CHANNELS: 'channels',
    },

    get DEFAULT_SETTINGS() {
        return {
            [this.SETTINGS.SERVER_HOSTNAME]: 'localhost',
            [this.SETTINGS.SERVER_PORT]: 51515,
            [this.SETTINGS.CHANNELS]: ['https://memo33.github.io/sc4pac/channel/'],
        };
    },

    get SETTINGS_VALIDITY() {
        return {
            [this.SETTINGS.SERVER_HOSTNAME]: {
                'pattern': '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$',
            },
            [this.SETTINGS.SERVER_PORT]: {
                'min': 0,
                'max': 65535,
            },
            [this.SETTINGS.CHANNELS]: {
                'pattern': '^https?:\/\/.+$',
            },
        };
    },
    

    /**
     * Gets the appropriate storage API for the current browser.
     * @returns {browser.storage.StorageArea|chrome.storage.StorageArea} The storage API instance.
     */
    getStorage() {
        try {
            // Firefox uses "browser" API, Chromium-based browsers use "chrome" API.
            // "browser.runtime.getBrowserInfo" is Firefox specific.
            return (typeof browser !== 'undefined' && browser.runtime.getBrowserInfo) 
                ? browser.storage.sync 
                : chrome.storage.sync
            ;
        } catch (error) {
            throw ErrorHandler.getCausedError('Storage API could not be retreived.', error);
        }
    },

    /**
     * Validates the provided settings.
     * @param {Object} settings The settings object to validate.
     * @returns {boolean} If the settings are valid.
     * @throws {Error} If there is an error while validating the settings.
     */
    validateSettings(settings) {
        try {
            const settingsValidity = this.SETTINGS_VALIDITY;
        
            for (const [setting, value] of Object.entries(settings)) {
                const validity = settingsValidity[setting];
                
                if (validity.pattern) {
                    if (setting === this.SETTINGS.CHANNELS) {
                        if (!Array.isArray(value) || !value.every(url => new RegExp(validity.pattern).test(url))) {
                            return false;
                        }
                    } else if (!new RegExp(validity.pattern).test(value)) {
                        return false;
                    }
                }
                
                if (validity.min !== undefined && validity.max !== undefined) {
                    const numValue = parseInt(value);
                    if (numValue < validity.min || numValue > validity.max) {
                        return false;
                    }
                }
            }
            
            return true;
        } catch (error) {
            throw ErrorHandler.getCausedError('Unable to validate provided settings.', error);
        }
    },
    
    /**
     * Saves the provided settings to storage.
     * @param {Object} settings The settings object to save.
     * @returns {Promise<true>} If the settings were saved successfully.
     * @throws {Error} If there was an error while saving the settings to storage.
     */
    async saveSettings(settings) {
        try {
            if (this.validateSettings(settings)) {
                await this.getStorage().set(settings);
                return true;
            } else {
                throw new Error('The provided settings are not valid.')
            }
        } catch (error) {
            throw ErrorHandler.getCausedError('The provided settings could not be saved to storage.', error);
        }

    },

    /**
     * Gets the settings from storage and returns them as an object.
     * @returns {Promise<Object>} The settings object.
     * @throws {Error} If there is an error retrieving the settings from storage.
     */
    async getSettings() {
        try {
            const settingsToGet = Object.fromEntries(
                Object.keys(this.SETTINGS)
                    .map(key => [
                        this.SETTINGS[key], 
                        this.DEFAULT_SETTINGS[this.SETTINGS[key]]
                    ])
            );
            
            return await this.getStorage().get(settingsToGet);
        } catch (error) {
            throw ErrorHandler.getCausedError('Error while getting settings from storage.', error);
        }
    },

    /**
     * Returns the value of a setting.
     * @param {string} setting The setting for which to get the value.
     * @return {Promise<string>} The value of the setting.
     * @throws {Error} If there is an error retrieving the setting from storage.
     */
    async getSetting(setting) {
        try {
            const settings = await this.getSettings();
            return settings[setting];
        } catch (error) {
            throw ErrorHandler.getCausedError(`Unable to retrieve "${setting}" from settings storage.`, error);
        }
    },

    /**
     * Resets the settings to default values.
     * @returns {Promise<true>} If the settings were reset successfully.
     * @throws {Error} If there was an error while saving the default settings.
     */
    async resetSettings() {
        try {
            await this.saveSettings(this.DEFAULT_SETTINGS)
            
            return true;
        } catch (error) {
            throw ErrorHandler.getCausedError('Error while saving default settings.', error);
        }
    },
};