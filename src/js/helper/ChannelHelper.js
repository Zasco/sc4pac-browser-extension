import ExtensionKernel from "../ExtensionKernel.js";
import sc4pacHelper from "./sc4pacHelper.js";
import SettingsHelper from "./SettingsHelper.js";

export default {
    CONTENTS_FILE_NAME: 'sc4pac-channel-contents.json',
    
    channelsContents: {},
    
    /**
     * Fetches the channel contents for a specific channel.
     * @param {string} channelUrl - The URL of the channel to fetch.
     * @return {Promise<Object|null>} The channel contents or null if none retreived.
     */
    async getChannelContents(channelUrl) {
        if (this.channelsContents[channelUrl]) {
            return this.channelsContents[channelUrl];
        }

        let response
        try {
            const urlObj = new URL('sc4pac-channel-contents.json', channelUrl);
            response = await fetch(urlObj.toString());
            if (!response.ok) {
                console.error('Channel contents was fetched, but response was not ok:', response);
                return null;
            }
        }
        catch(error) {
            console.error('Could not fetch channel contents:', error);
            return null;
        }

        try {
            const channelContents = await response.json();
            if (!channelContents) {
                console.error('Channel contents was parsed, but result was invalid:', channelContents);
                return null;
            }
            
            this.channelsContents[channelUrl] = channelContents;
            return this.channelsContents[channelUrl];
        }
        catch(error) {
            console.error('Could not parse into JSON the channel contents:', error);
            return null;
        }
    },
    
    /**
     * Fetches the channels contents.
     * @return {Promise<Object>} The channels contents.
     */
    async getChannelsContents() {
        if (Object.keys(this.channelsContents).length > 0) {
            return this.channelsContents;
        }
        
        let channelUrls;
        try {
            channelUrls = await SettingsHelper.getSetting(SettingsHelper.SETTINGS.CHANNELS);
        } catch (error) {
            const newError = new Error('Could not get channel URLs from settings.')
            newError.cause = error;
            ExtensionKernel.log('error', newError.message);
            throw newError;
        }
        
        for (const url of channelUrls) {
            try {
                this.channelsContents[url] = await this.getChannelContents(url);
            } catch (error) {
                console.error('Error fetching channel data:', error);
                continue;
            }
        }
        
        return this.channelsContents;
    },
    
    /**
     * Fetches the channel URL for a specific package.
     * @param {string} packageId - The package ID to get the channel for.
     * @return {Promise<string|null>} The channel URL or null if none found.
     */
    async getChannelForPackage(packageId) {
        try {
            for (const [url, channelContents] of Object.entries(await this.getChannelsContents())) {
                const packageInfo = sc4pacHelper.getPackagesFromContents(channelContents).find(pkg => sc4pacHelper.getPackageIdFromComponents(pkg.group, pkg.name) === packageId);
                if (packageInfo) {
                    const urlObj = new URL(url);
                    return `${urlObj.origin}${urlObj.pathname.split(this.CONTENTS_FILE_NAME)[0]}`;
                }
            }

            console.warn(`No channel found for package ${packageId}.`);
            return null;
        } catch (error) {
            ExtensionKernel.log('error', `Error while getting channel for package %b${packageId}%b:`, error);
            return null;
        }
    },

    /**
     * Checks if a package is in a channel listed in the extension settings.
     * @param {string} packageId - The package ID to check.
     * @return {Promise<boolean>} True if the package is in a channel, false otherwise.
     */
    async packageHasChannel(packageId) {
        return Boolean(await this.getChannelForPackage(packageId));
    }
}