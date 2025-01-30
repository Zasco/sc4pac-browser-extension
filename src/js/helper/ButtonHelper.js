const ButtonHelper = {
    MAIN_VIEW_BUTTON_ID: 'main-view-sc4pac-button',
    MAIN_ADD_BUTTON_ID: 'main-add-sc4pac-button',
    MAIN_REMOVE_BUTTON_ID: 'main-remove-sc4pac-button',
    
    /** @type {Object} The exchange helper instance. */
    exchangeHelper: null,
    
    /**
     * Initializes the button helper with an exchange helper.
     * @param {Object} exchangeHelper - The exchange helper instance.
     */
    init(exchangeHelper) {
        this.exchangeHelper = exchangeHelper;
    },


    /**
     * Creates a button for a specific package action.
     * @param {string} text - The button text.
     * @param {string} id - The button ID.
     * @param {string} action - The API action.
     * @returns {HTMLAnchorElement} The created button.
     */
    createActionButton(text, id, action) {
        const button = UIHelper.createButton(text, id);
        const fullId = this.exchangeHelper.extractFileFullIdFromUrl(window.location.href);
        const intId = this.exchangeHelper.getIntIdFromFullId(fullId);
        
        if (ExchangeHelper.fileIsInPackageList(intId, this.exchangeHelper.packages)) {
            const packageId = this.exchangeHelper.packages[intId];
            this.attachClickHandler(button, packageId, action);
        }
        return button;
    },

    /**
     * Creates a view button element.
     * @returns {HTMLAnchorElement} The created view button.
     */
    createViewButton() {
        return this.createActionButton(
            'View on sc4pac', 
            this.MAIN_VIEW_BUTTON_ID, 
            APIHelper.OPEN_PACKAGE_ACTION
        );
    },

    /**
     * Creates an add button element.
     * @returns {HTMLAnchorElement} The created add button.
     */
    createAddButton() {
        return this.createActionButton(
            'Add to sc4pac', 
            this.MAIN_ADD_BUTTON_ID, 
            APIHelper.ADD_PLUGINS_ACTION
        );
    },

    /**
     * Creates an add button element.
     * @returns {HTMLAnchorElement} The created add button.
     */
    createRemoveButton() {
        return this.createActionButton(
            'Remove from sc4pac', 
            this.MAIN_REMOVE_BUTTON_ID, 
            APIHelper.REMOVE_PLUGIN_ACTION
        );
    },

    /**
     * Creates a button group container.
     * @param {string} packageId - The ID of the package.
     * @param {string} groupId - The ID for the button group.
     * @returns {HTMLElement} The created button group container.
     */
    createButtonGroup(packageId, groupId) {
        const btnGroup = UIHelper.createContainer(groupId, 'btn-group');
        btnGroup.appendChild(this.createViewButton());

        // Determine wether to add "add" or "remove" button.
        sc4pacHelper.packageIsExplicitlyAdded(packageId).then(isAdded => {
            if (isAdded) {
                btnGroup.appendChild(this.createRemoveButton());
                ExtensionKernel.log('info', `Added "%bremove%b" button as package %b${packageId}%b is explicitely added.`);
            } else {
                btnGroup.appendChild(this.createAddButton());
                ExtensionKernel.log('info', `Added "%badd%b" button as package %b${packageId}%b is not explicitely added.`);
            }
        });
        
        return btnGroup;
    },

    /**
     * Attaches a click handler to a button for a specific package action.
     * @param {HTMLAnchorElement} button - The button element to attach the handler to.
     * @param {string} packageId - The package ID.
     * @param {string} action - The API action (packages.open or packages.add).
     */
    async attachClickHandler(button, packageId, action) {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                APIHelper.makeRequest(action, packageId);
            } catch (error) {
                console.warn(`Error while making request for "${action}" action for package "${packageId}".`, error);
            }
        });
    },


    /**
     * Gets the view button element.
     * @returns {HTMLButtonElement|null} The view button element if found.
     */
    getViewButton() {
        return document.getElementById(this.MAIN_VIEW_BUTTON_ID);
    },

    /**
     * Gets the add button element.
     * @returns {HTMLButtonElement|null} The add button element if found.
     */
    getAddButton() {
        return document.getElementById(this.MAIN_ADD_BUTTON_ID);
    },

    /**
     * Gets the button group element with the provided ID.
     * @param {string} groupId - The ID of the button group to find.
     * @returns {HTMLElement|null} The button group element if found.
     */
    getButtonGroup(groupId) {
        return document.getElementById(groupId);
    },
};