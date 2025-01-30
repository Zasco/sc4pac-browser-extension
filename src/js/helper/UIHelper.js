export default {
    EXTENSION_CLASS: 'sc4pac-be',
    
    /**
     * Creates a container element with a given ID and class.
     * @param {string} id - The ID of the container.
     * @param {string} className - The class of the container.
     * @return {HTMLElement} The created container element.
     */
    createContainer(id, className) {
        const container = document.createElement('span');
        container.id = id;
        container.className = `${this.EXTENSION_CLASS} ${className}`;
        return container;
    },

    /**
     * Creates a button element with a given text and ID.
     * @param {string} text - The text to display on the button.
     * @param {string} id - The ID of the button.
     * @returns {HTMLButtonElement} The created button element.
     */
    createButton(text, id) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `${this.EXTENSION_CLASS} btn btn-primary btn-sm`;
        button.id = id;
        
        return button;
    },
};