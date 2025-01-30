// See https://memo33.github.io/sc4pac/#/api
const APIHelper = {
    OPEN_PACKAGE_ACTION: 'packages.open',
    ADD_PLUGINS_ACTION: 'plugins.add',
    INFO_PACKAGE_ACTION: 'packages.info',
    REMOVE_PLUGIN_ACTION: 'plugins.remove',

    SERVER_STATUS_ACTION: 'server.status',
    PROFILE_LIST_ACTION: 'profiles.list',
    
    DEFAULT_PROFILE: 1,

    getActions() {
        return Object.keys(this)
            .filter(key => key.endsWith('_ACTION'))
            .reduce((acc, key) => {
                acc[key] = this[key];
                return acc;
            }, {})
        ;
    },
    
    /**
     * Returns the path for a specific action.
     * @param {string} action - The action to get the path for.
     * @returns {string} The path for the specified action.
     */
    getPathForAction(action) {
        this.checkIsValidAction(action);
        return action;
    },

    checkIsValidAction(action) {
        const validActions = this.getActions();
        if (Object.values(validActions).includes(action)) return true;
        throw new Error(`Invalid action: "${action}".`);
    },

    /**
     * Makes a request to the sc4pac API for a specific action and package.
     * @param {string} action - The action to make the request for.
     * @param {string|undefined} packageId - The package to make the request for.
     */
    async makeRequest(action, packageId = undefined) {
        this.checkIsValidAction(action);
        ExtensionKernel.log('debug', `Making request for "%b${action}%b" action.`);
        
        try {
            const serverUrl = await sc4pacHelper.getServerUrl();
            
            const endpoint = new URL(serverUrl);
            endpoint.pathname = this.getPathForAction(action);
            let method = null;
            let payload = [];
            let channelUrl = null;

            // If we're making a request with a package.
            if (packageId) {
                // Check package is available on any listed channel.
                channelUrl = await ChannelHelper.getChannelForPackage(packageId);
                if (!channelUrl) {
                    throw new Error('Package not found in any listed channel.');
                }
            }

            // Set request method.
            switch (action) {
                case this.OPEN_PACKAGE_ACTION:
                case this.ADD_PLUGINS_ACTION:
                case this.REMOVE_PLUGIN_ACTION:
                    method = 'POST';
                    break;
                
                case this.INFO_PACKAGE_ACTION:
                case this.SERVER_STATUS_ACTION:
                    method = 'GET';
                    break;
            }

            // Set request URL and payload.
            switch (action) {
                case this.OPEN_PACKAGE_ACTION:
                    payload = [{
                        'package': packageId,
                        'channelUrl': channelUrl,
                    }];
                    break;
                
                case this.ADD_PLUGINS_ACTION:
                case this.REMOVE_PLUGIN_ACTION:
                    // Makes the request for the default profile. To be improved...
                    endpoint.searchParams.append('profile', String(this.DEFAULT_PROFILE));
                    payload = [packageId];
                    break;
                
                case this.INFO_PACKAGE_ACTION:
                    endpoint.searchParams.append('pkg', packageId);
                    // Makes the request for the default profile. To be improved...
                    endpoint.searchParams.append('profile', String(this.DEFAULT_PROFILE));
                    break;
            }
            
            const requestOptions = ['GET', 'HEAD'].includes(method) 
                ? undefined 
                : {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            ;
            const response = await fetch(endpoint, requestOptions);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            ExtensionKernel.log('debug', `"${action}" request to sc4pac API successful:`, response);
            
            const responseBody = await response.json();
            ExtensionKernel.log('debug', 'Response body:', responseBody);
            return responseBody;
        } catch (error) {
            //if (error instanceof TypeError && error.message.includes('NetworkError')) extensionKernel.log('warn', `Server at ${serverUrl} is not responding. Make sure it's running.`);
            //extensionKernel.log('error', 'Unable to connect to sc4pac server:', error);
            
            throw ErrorHandler.getCausedError('Unable to make request to API.', error);
        }
    },
}