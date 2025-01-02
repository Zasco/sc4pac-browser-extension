const logger = {
    STYLING_TAG: '%c',
    BOLD_STYLE_TAG: '%b',

    /**
     * Makes the provided text bold in console.
     * @param {string} text The text to make bold.
     * @returns {string} The bolded text.
     */
    makeBold(text) {
        return this.BOLD_STYLE_TAG + text + this.BOLD_STYLE_TAG;
    },
    
    /**
     * Log a message to console.
     * @param {string} type The type of log message.
     * @param {string} message The message to log.
     * @param {string} [content] The content to log (optional).
     * @returns {boolean} True if the log was successful, false otherwise.
     */
    log(type, message, content) {
        if (!type) type = 'log';
        
        if (!['log', 'info', 'warn', 'error', 'debug'].includes(type)) {
            console.warn(`Log of type ${type} invalid.`)
            return false;
        }

        // Handle CSS styling
        const parts = message.split(new RegExp(`(${this.BOLD_STYLE_TAG}.*?${this.BOLD_STYLE_TAG})`, 'g'));
        //console.log(parts)
        const formattedMessage = parts.map(part => {
            if (part.startsWith(this.BOLD_STYLE_TAG)) {
                return this.STYLING_TAG + part.slice(2, -2) + this.STYLING_TAG;
            }
            return part;
        }).join('');

        const args = [formattedMessage];
        
        // Add style immediately after each part it applies to
        parts.forEach(part => {
            let partStyle;
            
            // Bold.
            if (part.startsWith(this.BOLD_STYLE_TAG)) partStyle = 'font-weight: bold;';

            // Set style for part and reset for next part.
            if (partStyle !== undefined) args.push(partStyle, '');
        });

        if (content !== undefined) {
            args.push(content);
        }

        console[type].apply(console, args);
        return true;
    },
}