import ErrorHandler from "../ErrorHandler.js";

import ExtensionKernel from "../ExtensionKernel.js";
import APIHelper from "./APIHelper.js";
import SettingsHelper from "./SettingsHelper.js"

export default {
    /**
     * Gets the formatted server URL with protocol and port.
     * @returns {Promise<string>} The complete server URL (e.g., "http://localhost:51515").
     * @throws {Error} If server hostname or port is not configured.
     */
    async getServerUrl() {
        const hostname = await SettingsHelper.getSetting(SettingsHelper.SETTINGS.SERVER_HOSTNAME);
        const port = await SettingsHelper.getSetting(SettingsHelper.SETTINGS.SERVER_PORT);

        if (!hostname || !port) {
            throw new Error('Server hostname or port not configured');
        }

        // Remove any existing protocol and trailing slashes
        let formattedHostname = hostname
            .replace(/^https?:\/\//, '')
            .replace(/\/+$/, '');
        
        // Add http protocol
        formattedHostname = `http://${formattedHostname}`;

        return `${formattedHostname}:${port}`;
    },

    /**
     * Returns the sc4pac server status.
     * @returns {Promise<Object>} The server status with version information.
     * @throws {Error} If the server status request fails.
     */
    async getServerStatus() {
        try {
            return await APIHelper.makeRequest(APIHelper.SERVER_STATUS_ACTION);
        } catch (error) {
            throw ErrorHandler.getCausedError('Could not get server status.', error);
        }
    },

    /**
     * Checks if the sc4pac server is running and available.
     * @returns {Promise<boolean>} If server is running.
     */
    async serverIsRunning() {
        try {
            const serverSatus = await this.getServerStatus();
            if (serverSatus || serverSatus.sc4pacVersion) return true;
        } catch (error) {
            console.warn(`Server is likely closed as it's status could not be retreived.`, error);
        }
        return false;
    },

    /**
     * Returns if the provided package is explicitely added to sc4pac.
     * @param {string} packageId - The ID of the package to check.
     * @returns {Promise<boolean>} True if the package is explicitely added, false otherwise.
     * @throws {Error} If the package added status cannot be retrieved.
     */
    async packageIsExplicitlyAdded(packageId/* , profileId */) {
        const packageInfo = await APIHelper.makeRequest(APIHelper.INFO_PACKAGE_ACTION, packageId);
        try {
            return packageInfo.local.statuses[packageId] && packageInfo.local.statuses[packageId].explicit;
        }
        catch (error) {
            ExtensionKernel.log('error', `Could not get package ${packageId} added status.`, error);
            throw ErrorHandler.getCausedError(`Unable to get package added status from it's server infos.`, error)
        }
    },

    getPackageIdFromComponents(group, name) {
        return group +':'+ name;
    },

    getPackagesFromContents(channelContents) {
        return channelContents.packages;
    },
}