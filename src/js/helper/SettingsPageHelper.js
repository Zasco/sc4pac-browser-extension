import ErrorHandler from '../ErrorHandler.js';

import SettingsHelper from './SettingsHelper.js';
import SettingsMappingHelper from './SettingsMappingHelper.js';
import SettingsPageConfig from '../config/SettingsPageConfig.js';

export default {
    STATUS_CONTAINER_ID: 'status-container',
    STATUS_DISPLAY_TIMEOUT: 2500,
    STATUS_SUCCESS: 'success',
    STATUS_ERROR: 'error',
    

    // Inits //
    
    /**
     * Initializes the settings page functionalities.
     * @returns {boolean} If the settings page functionalities were initialized successfully.
     */
    initPage() {
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                // Mandatory success.
                const form = await this.initForm();
                
                // Optional success.
                this.initButtons()

                // When settings are successfuly saved, update input values.
                /* document.addEventListener(settingsHelper.EVENTS.SETTINGS_SAVE_SUCCESS, (saveSettingsEvent) => {
                    const settings = saveSettingsEvent.detail;
                    const inputValues = settingsMappingHelper.mapSettingsToInputValues(settings);
                    this.setInputValues(inputValues);
                    this.addToStatusQueue('Settings saved.', this.STATUS_SUCCESS);
                })
                document.addEventListener(settingsHelper.EVENTS.SETTINGS_SAVE_FAIL, (saveSettingsEvent) => {
                    this.addToStatusQueue('Settings save failed.', this.STATUS_FAIL);
                }) */

                console.info(`Settings page successfuly initialized.`);
            } catch (error) {
                console.warn(`Settings page could not be initialized.`, error);
            }
        });
        return true;
    },

    /**
     * Initializes the settings form.
     * @returns {Promise<HTMLFormElement>} The initialized form element.
     * @throws {Error} If the settings form initialization failed.
     */
    async initForm() {
        try {
            const form = this.getFormElement();

            // Suspend default submit event on form.
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
            });

            // Check form has all required fields.
            this.checkFormIsComplete(form);

            await this.initInputs();
            
            // Once everything is ready, add submit handler to form.
            form.addEventListener('submit', () => {
                this.saveSettingsFromInputs();
            });

            return form;
        } catch (error) {
            throw ErrorHandler.getCausedError('Settings form could not be initialized.', error);
        }
    },

    /**
     * Initializes the form inputs.
     * @returns {Promise<true>} If the input initialization proccess was successful.
     * @throws {Error} If the input initialization proccess failed.
     */
    async initInputs() {
        try {
            this.setPlaceholders();

            const settingsValidity = SettingsHelper.SETTINGS_VALIDITY;
            this.getElement(SettingsPageConfig.INPUT_IDS.HOSTNAME).setAttribute('pattern', settingsValidity[SettingsHelper.SETTINGS.SERVER_HOSTNAME]['pattern']);
            this.getElement(SettingsPageConfig.INPUT_IDS.PORT).setAttribute('min', settingsValidity[SettingsHelper.SETTINGS.SERVER_PORT]['min']);
            this.getElement(SettingsPageConfig.INPUT_IDS.PORT).setAttribute('max', settingsValidity[SettingsHelper.SETTINGS.SERVER_PORT]['max']);
            
            this.initChannelsInput();

            if (!await this.restoreSettingsToInputs()) {
                await this.setDefaultInputValues();
            }

            return true;
        } catch (error) {
            throw ErrorHandler.getCausedError('Could not initialize inputs.', error);
        }
    },

    /**
     * Initializes the channels input.
     * @returns {boolean} If the channels input was initialized successfully.
     */
    initChannelsInput() {
        try {
            const channelsInput = this.getElement(SettingsPageConfig.INPUT_IDS.CHANNELS);
            const urlPattern = new RegExp(SettingsHelper.SETTINGS_VALIDITY[SettingsHelper.SETTINGS.CHANNELS].pattern);
        
            channelsInput.addEventListener('input', () => {
                const lines = channelsInput.value.split('\n').filter(line => line.trim());
                
                if (lines.length === 0) {
                    return;
                }
                
                const invalidUrls = lines.filter(line => !urlPattern.test(line.trim()));
                if (invalidUrls.length > 0) {
                    channelsInput.setCustomValidity('All lines must contain valid URLs.');
                    return;
                }
                
                channelsInput.setCustomValidity('');
            });
    
            return true;
        } catch (error) {
            console.warn(`Could not initialize "${SettingsPageConfig.INPUT_IDS.CHANNELS}" input.`, error);
            return false;
        }
    },

    /**
     * Initializes the buttons.
     * @returns {boolean} If all the buttons were initialized successfully.
     */
    initButtons() {
        function defaultWarn(button, error) {
            console.warn(`${button} button could not be initialized.`, error);
        }
        let success = true;
        try {
            success = this.initSaveButton() && success;
        } catch (error) {
            defaultWarn('Save', error);
            success = false;
        }
        try {
            success = this.initRestoreButton() && success;
        } catch (error) {
            defaultWarn('Restore', error);
            success = false;
        }
        try {
            success = this.initResetButton() && success;
        } catch (error) {
            defaultWarn('Reset', error);
            success = false;
        }
        return success;
    },

    /**
     * Initializes a button with a given ID and click handler.
     * @param {string} buttonId The ID of the button.
     * @param {function} clickHandler The click handler for the button.
     * @returns {boolean} If the button was initialized successfully.
     */
    initButton(buttonId, clickHandler) {
        let button;
        try {
            button = this.getElement(buttonId);
        } catch (error) {
            console.warn(`Button element "${buttonId}" could not be retrieved. It's functionality won't work.`, error);
            return false;
        }
        button.addEventListener('click', () => {
            //if (confirm('Are you sure you want to overide the settings? This will clear all saved settings and set defaults.')) {
            if (confirm('Are you sure?')) {
                clickHandler();
            }
        });
        return true;
    },

    /**
     * Initializes the save button.
     * @returns {boolean} If the save button was initialized successfully.
     */
    initSaveButton() {
        // Add keyboard shortcut.
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                this.getFormElement().requestSubmit();
            }
        });
        return true;
    },

    /**
     * Initializes the restore button.
     * @returns {boolean} If the restore button was initialized successfully.
     */
    initRestoreButton() {
        return this.initButton(
            SettingsPageConfig.RESTORE_BUTTON_ID, 
            () => this.restoreSettingsToInputs()
        );
    },

    /**
     * Initializes the reset button.
     * @returns {boolean} If the reset button was initialized successfully.
     */
    initResetButton() {
        return this.initButton(
            SettingsPageConfig.RESET_BUTTON_ID, 
            () => this.resetSettings()
        );
    },


    // Operations //

    /**
     * Checks if the form is complete.
     * @param {HTMLFormElement} form - The form element to check.
     * @returns {true} If the form is complete.
     * @throws {Error} If the form is not complete.
     */
    checkFormIsComplete(form) {
        try {
            this.getInputElements();
            return true;
        } catch (error) {
            const missingInputError = ErrorHandler.getCausedError('An input element is missing from the form.', error);

            // Display the error in status on form submit as a clue.
            form.addEventListener('submit', async (event) => {
                this.addToStatusQueue('Settings page is broken.', this.STATUS_ERROR)
            });
            
            throw missingInputError;
        }
    },

    /**
     * Sets the placeholders for the input elements.
     * @returns {boolean} If the placeholders were set successfully.
     */
    setPlaceholders() {
        try {
            const inputElements = this.getInputElements();
            const basePlaceholder = 'Default: ';
            
            Object.entries(inputElements).forEach(([inputId, element]) => {
                const setting = SettingsMappingHelper.getSettingForInput(inputId);
                element.placeholder = `${basePlaceholder}${SettingsHelper.DEFAULT_SETTINGS[setting]}`;
            });
            return true;
        } catch (error) {
            console.warn('Inputs placeholder could not be set.', error)
            return false;
        }
    },
    
    /**
     * Saves the settings from the inputs value.
     * @returns {Promise<boolean>} If the settings were saved successfully.
     */
    async saveSettingsFromInputs() {
        try {
            const inputValues = this.getInputValues();
            const settingsValues = SettingsMappingHelper.mapInputValuesToSettings(inputValues);
            await SettingsHelper.saveSettings(settingsValues);
            
            this.addToStatusQueue('Settings saved.', this.STATUS_SUCCESS);
            return true;
        }
        catch (error) {
            return ErrorHandler.handleSettingsError(
                error, 
                'Error while saving settings.', 
                'Settings save failed.'
            )
        }
    },
    
    /**
     * Restores the saved settings to the input values.
     */
    async restoreSettingsToInputs() {
        try {
            const settings = await SettingsHelper.getSettings();
            const inputValues = SettingsMappingHelper.mapSettingsToInputValues(settings);
            
            await this.setInputValues(inputValues);

            this.addToStatusQueue('Settings restored.', this.STATUS_SUCCESS);
            return true;
        } catch (error) {
            return ErrorHandler.handleSettingsError(
                error, 
                'Settings could not be restored.', 
                'Settings NOT restored.', 
            );
        }
    },

    /**
     * Resets the settings to their default values.
     * @returns {Promise<boolean>} If the settings were reset successfully.
     */
    async resetSettings() {
        try {
            await SettingsHelper.resetSettings();

            const settings = await SettingsHelper.getSettings();
            const inputValues = SettingsMappingHelper.mapSettingsToInputValues(settings);
            
            await this.setInputValues(inputValues);

            this.addToStatusQueue('Settings reset.', this.STATUS_SUCCESS);
            return true;
        } catch (error) {
            return ErrorHandler.handleSettingsError(
                error, 
                'Settings could not be reset.', 
                'Settings NOT reset.', 
            );
        }
    },

    /**
     * Sets the default values to the inputs.
     * @returns {Promise<boolean>} True if the default values were set successfully, false otherwise.
     */
    async setDefaultInputValues() {
        try {
            const defaultSettingsValues = SettingsHelper.DEFAULT_SETTINGS;
            const defaultInputValues = SettingsMappingHelper.mapSettingsToInputValues(defaultSettingsValues)

            try {
                await this.setInputValues(defaultInputValues);
            } catch (error) {
                throw ErrorHandler.getCausedError('Could not set default values in inputs.', error);
            }
    
            //settingsPageHelper.addToStatusQueue('Reset succeeded.', settingsPageHelper.STATUS_SUCCESS);
            this.addToStatusQueue('Default settings set.', this.STATUS_SUCCESS);
            return true;
        } catch (error) {
            console.warn(`Default input values could not be set.`, error);
            //settingsPageHelper.addToStatusQueue('Reset failed.', settingsPageHelper.STATUS_ERROR);
            return false;
        }
    },


    // Getters //

    /**
     * Returns an element by its ID.
     * @param {string} elementId - The ID of the element.
     * @returns {HTMLInputElement} The element.
     * @throws {Error} If the element is not found.
     */
    getElement(elementId) {
        const element = document.getElementById(elementId);
        if (!element) throw new Error(`Element "${elementId}" not found.`);
        return element;
    },

    /**
     * Returns the form element.
     * @returns {HTMLFormElement} The form element.
     * @throws {Error} If the element is not a form.
     */
    getFormElement() {
        const form = this.getElement(SettingsPageConfig.FORM_ID);
        if (!(form instanceof HTMLFormElement)) throw new Error(`Element with id "${SettingsPageConfig.FORM_ID}" is not a form element.`);
        return form;
    },

    /**
     * Returns a list of the input elements.
     * @returns {Object} An object where keys are input IDs and values are input elements.
     */
    getInputElements() {
        return Object.fromEntries(
            Object.values(SettingsPageConfig.INPUT_IDS)
                .map(id => [id, this.getElement(id)])
        );
    },

    /**
     * Returns the status container element.
     * @returns {HTMLDivElement} The status container element.
     */
    getStatusContainer() {
        return this.getElement(this.STATUS_CONTAINER_ID);
    },
    

    // Values //
    
    /**
     * Returns the value of an input element by its ID.
     * @param {string} inputId - The ID of the input element.
     * @returns {string} The value of the input element.
     * @throws {Error} If the input value could not be retreived.
     */
    getInputValue(inputId) {
        try {
            return this.getElement(inputId).value;
        } catch (error) {
            throw ErrorHandler.getCausedError(`Could not get input value for "${inputId}".`, error);
        }
    },

    /**
     * Returns an input values object.
     * @returns {Object} An object where keys are input IDs and values are the current values of the input elements.
     * @throws {Error} If the input values could not be retrieved.
     */
    getInputValues() {
        try {
            return Object.fromEntries(
                Object.values(SettingsPageConfig.INPUT_IDS)
                    .map(id => [id, this.getInputValue(id)])
            );
        } catch (error) {
            throw ErrorHandler.getCausedError('Could not get input values.', error);
        }
    },

    /**
     * Sets the value of an input element by its ID.
     * @param {string} inputId The ID of the input element.
     * @param {string} value The value to set for the input element.
     * @returns {Promise<true>} If the value was set successfully.
     * @throws {Error} If the value could not be set.
     */
    async setInputValue(inputId, value) {
        try {
            const inputElement = this.getElement(inputId);
            inputElement.value = value;
            inputElement.dispatchEvent(new Event('input'));
            return true;
        } catch (error) {
            throw ErrorHandler.getCausedError(`Could not set input value for "${inputId}".`, error);
        }
    },

    /**
     * Sets the values of input elements.
     * @param {Object} values An object where keys are input IDs and values are the new values for the input elements.
     * @throws {Error} If the values could not be set.
     */
    async setInputValues(values) {
        try {
            for (const [inputId, value] of Object.entries(values)) {
                await this.setInputValue(inputId, value);
            }
        } catch (error) {
            throw ErrorHandler.getCausedError('Could not set input values.', error);
        }
    },


    // Status //

    /**
     * Adds a status message to the status container.
     * @param {string} status - The status message.
     * @param {string} type - The type of status message ('success' or 'error').
     * @return {boolean} If the status was added successfully.
     */
    addToStatusQueue(status, type) {
        try {
            let statusContainer;
            try {
                statusContainer = this.getStatusContainer();
            } catch (error) {
                throw ErrorHandler.getCausedError('Could not retrieve status container.', error);
            }
            
            const statusElement = document.createElement('span');
            statusElement.textContent = status;
            switch (type) {
                case this.STATUS_SUCCESS:
                    statusElement.classList.add('status-success');
                    break;
                
                case this.STATUS_ERROR:
                    statusContainer.replaceChildren();
                    statusElement.classList.add('status-error');
                    break;
            }
            statusContainer.appendChild(statusElement);
            
            setTimeout(
                () => {if (statusContainer.contains(statusElement)) statusContainer.removeChild(statusElement);}, 
                this.STATUS_DISPLAY_TIMEOUT
            );

            return true;
        } catch (error) {
            console.warn(`"${status}" could not be added to status queue.`, error);
            return false;
        }
    },
}