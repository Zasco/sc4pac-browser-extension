const ErrorHandler = {
    getCausedError(message, originalError) {
        const causedError = new Error(message);
        causedError.cause = originalError;
        return causedError;
    },

    handleSettingsError(error, consoleMessage, userMessage) {
        console.warn(consoleMessage, error);
        SettingsPageHelper.addToStatusQueue(userMessage, SettingsPageHelper.STATUS_ERROR);
        return false;
    }
};