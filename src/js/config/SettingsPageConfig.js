import SettingsHelper from "../helper/SettingsHelper.js"

export default {
    FORM_ID: 'settings-form',
    INPUT_IDS: {
        HOSTNAME: SettingsHelper.SETTINGS.SERVER_HOSTNAME, 
        PORT: SettingsHelper.SETTINGS.SERVER_PORT, 
        CHANNELS: SettingsHelper.SETTINGS.CHANNELS, 
    },
    RESTORE_BUTTON_ID: 'restore-button',
    RESET_BUTTON_ID: 'reset-button',
}