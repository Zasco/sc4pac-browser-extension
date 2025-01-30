const SettingsMappingHelper = {
    SETTINGS_INPUT_MAP: {
        [SettingsHelper.SETTINGS.SERVER_HOSTNAME]: SettingsPageHelper.INPUT_IDS.HOSTNAME,
        [SettingsHelper.SETTINGS.SERVER_PORT]: SettingsPageHelper.INPUT_IDS.PORT,
        [SettingsHelper.SETTINGS.CHANNELS]: SettingsPageHelper.INPUT_IDS.CHANNELS
    },

    /**
     * Returns the input ID for a given setting.
     * @param {string} setting The setting for which to get the input ID.
     * @return {string} The input ID for the setting.
     */
    getInputIdForSetting(setting) {
        return this.SETTINGS_INPUT_MAP[setting];
    },

    /**
     * Returns the setting for a given input ID.
     * @param {string} inputId The input ID for which to get the setting.
     * @return {string} The setting for the input ID.
     */
    getSettingForInput(inputId) {
        return Object.keys(this.SETTINGS_INPUT_MAP).find(
            key => this.SETTINGS_INPUT_MAP[key] === inputId
        );
    },

    /**
     * Maps a settings object to an input values object.
     * @param {Object} settings The settings object to map.
     * @returns {Object} The mapped input values objedct. An object with input IDs as keys and setting values as values.
     * @throws {Error} If there is an error while mapping settings to input values.
     */
    mapSettingsToInputValues(settings) {
        try {
                return Object.entries(settings).reduce((acc, [setting, value]) => {
                const inputId = this.getInputIdForSetting(setting);
                return {
                    ...acc,
                    [inputId]: setting === SettingsHelper.SETTINGS.CHANNELS
                        ? this.stringifyChannelsArray(value)
                        : value
                };
            }, {});
        } catch (error) {
            ErrorHandler.getCausedError('Could not map settings to input values.', error);
        }
    },

    /**
     * Maps an input values object to a settings object.
     * @param {Object} inputValues An object with input IDs as keys and values.
     * @returns {Object} The mapped settings object. An object with settings as keys and values.
     * @throws {Error} If there is an error while mapping input values to settings.
     */
    mapInputValuesToSettings(inputValues) {
        try {
            return Object.entries(inputValues).reduce((acc, [inputId, value]) => {
                const setting = this.getSettingForInput(inputId);
                return {
                    ...acc,
                    [setting]: setting === SettingsHelper.SETTINGS.CHANNELS
                        ? this.parseChannelsString(value)
                        : value
                };
            }, {});
        } catch (error) {
            ErrorHandler.getCausedError('Could not map input values to settings.', error);
        }
    },

    /**
     * Sets input values from a settings object.
     * @param {Object} settings The settings to set.
     * @returns {Promise<boolean>} True if successful.
     */
    async setInputValuesFromSettings(settings) {
        try {
            const inputValues = this.mapSettingsToInputValues(settings);
            await SettingsPageHelper.setInputValues(inputValues);
            return true;
        } catch (error) {
            throw ErrorHandler.getCausedError('Could not set input values from settings.', error);
        }
    },

    
    /**
     * Parses a string of channel URLs into an array.
     * @param {string} channelsString - The string of channel URLs.
     * @return {Array<string>} The array of channel URLs.
     * @throws {Error} If there is an error parsing the channels string.
     */
    parseChannelsString(channelsString) {
        try {
            return channelsString.split('\n').filter(url => url.trim());
        } catch (error) {
            throw ErrorHandler.getCausedError('Unable to parse channels string.', error);
        }
    },

    /**
     * Stringifies an array of channel URLs into a string.
     * @param {Array<string>} channelsArray The array of channel URLs.
     * @returns {string} The string of channel URLs.
     * @throws {Error} If there is an error parsing the channels string.
     */
    stringifyChannelsArray(channelsArray) {
        try {
            return channelsArray.join('\n');
        } catch (error) {
            throw ErrorHandler.getCausedError('Unable to stringify channels array.', error);
        }
    },
}