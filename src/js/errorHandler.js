const errorHandler = {
    getCausedError(message, originalError) {
        const causedError = new Error(message);
        causedError.cause = originalError;
        return causedError;
    },

    handleSettingsError(error, consoleMessage, userMessage) {
        console.warn(consoleMessage, error);
        settingsPageHelper.addToStatusQueue(userMessage, settingsPageHelper.STATUS_ERROR);
        return false;
    }
};